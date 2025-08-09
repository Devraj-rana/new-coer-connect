"use client";
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import NewMessageDialog from '@/components/messages/NewMessageDialog';

interface ThreadItem {
  _id: string;
  participants: string[];
  lastMessage?: string;
  lastSenderId?: string | null;
  updatedAt: string;
  otherUser: {
    userId: string;
    firstName: string;
    lastName: string;
    profilePhoto: string;
    role: 'student' | 'teacher' | 'admin';
  } | null;
  unread: number;
}

interface MessageDoc {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readBy: string[];
}

export default function MessagesPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const me = user?.id;
  const activeThread = useMemo(() => threads.find(t => t._id === activeId) || null, [threads, activeId]);

  // Load threads
  useEffect(() => {
    const run = async () => {
      try {
        setLoadingThreads(true);
        const res = await fetch('/api/messages/threads', { cache: 'no-store' });
        const json = await res.json();
        setThreads(json.threads || []);
        const desired = searchParams.get('thread');
        if (desired && json.threads?.some((t: any) => t._id === desired)) {
          setActiveId(desired);
        } else if (!activeId && json.threads?.[0]?._id) {
          setActiveId(json.threads[0]._id);
        }
      } finally {
        setLoadingThreads(false);
      }
    };
    run();
  }, [activeId, searchParams]);

  // Load messages when active thread changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeId) return;
      const res = await fetch(`/api/messages/threads/${activeId}/messages`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setMessages(json.messages || []);
        // Mark as read
        fetch(`/api/messages/threads/${activeId}/read`, { method: 'POST' });
      }
    };
    loadMessages();
  }, [activeId]);

  // Poll typing status
  useEffect(() => {
    let timer: any;
    const poll = async () => {
      if (!activeId) return;
      try {
        const res = await fetch(`/api/messages/threads/${activeId}/typing`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setIsOtherTyping(Array.isArray(json.typingUserIds) && json.typingUserIds.length > 0);
        }
      } finally {
        timer = setTimeout(poll, 2000);
      }
    };
    poll();
    return () => { if (timer) clearTimeout(timer); };
  }, [activeId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!msg.trim() || !activeId) return;
    try {
      setSending(true);
      const res = await fetch(`/api/messages/threads/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: msg.trim() }),
      });
      if (res.ok) {
        const { message } = await res.json();
        setMessages(prev => [...prev, message]);
        setMsg('');
        // Refresh thread list ordering and preview
        const tl = await fetch('/api/messages/threads', { cache: 'no-store' }).then(r=>r.json());
        setThreads(tl.threads || []);
      }
    } finally {
      setSending(false);
    }
  };

  const fetchPeople = useCallback(async (query: string) => {
    const url = query?.trim() ? `/api/people/search?q=${encodeURIComponent(query)}` : `/api/people/search`;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return [];
      const json = await res.json();
      return json.results || [];
    } catch { return []; }
  }, []);

  const startWithUser = useCallback(async (userId: string) => {
    setNewOpen(false);
    const res = await fetch('/api/messages/threads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId: userId }) });
    const json = await res.json();
    if (res.ok) setActiveId(json.threadId);
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Threads list */}
        <Card className="md:col-span-1">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Messages</CardTitle>
            <Button size="sm" variant="outline" onClick={()=>setNewOpen(true)}>New</Button>
          </CardHeader>
          <CardContent>
            {loadingThreads ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : threads.length === 0 ? (
              <div className="text-sm text-gray-500">No conversations yet.</div>
            ) : (
              <div className="space-y-2">
                {threads.map(t => (
                  <button key={t._id} onClick={() => setActiveId(t._id)} className={`w-full flex items-center gap-3 p-2 rounded ${activeId===t._id? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      <Image src={t.otherUser?.profilePhoto || '/default-avator.png'} alt="avatar" width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{t.otherUser ? `${t.otherUser.firstName} ${t.otherUser.lastName}` : 'Unknown'}</div>
                        {t.unread > 0 && <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">{t.unread}</span>}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">{t.lastMessage || 'Start chatting'}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message panel */}
        <Card className="md:col-span-2 flex flex-col">
          <CardHeader>
      <CardTitle>
              {activeThread ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                    <Image src={activeThread.otherUser?.profilePhoto || '/default-avator.png'} alt="avatar" width={32} height={32} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-base font-medium">{activeThread.otherUser ? `${activeThread.otherUser.firstName} ${activeThread.otherUser.lastName}` : 'Conversation'}</div>
        <div className="text-xs text-gray-500">{isOtherTyping ? 'typing…' : (activeThread.otherUser?.role === 'teacher' ? 'Teacher' : 'Student')}</div>
                  </div>
                </div>
              ) : 'Select a conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeId ? (
                messages.map(m => (
                  <div key={m._id} className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${m.senderId===me ? 'ml-auto bg-blue-600 text-white' : 'bg-gray-100'}`}>
                    {m.content}
                    <div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 px-4">Pick a conversation to start chatting.</div>
              )}
            </div>
            <div className="p-3 border-t flex items-center gap-2">
              <Input value={msg} onChange={async (e)=>{
                const v = e.target.value; setMsg(v);
                if (activeId) {
                  // fire-and-forget typing event; minimal debounce via microtask queue
                  fetch(`/api/messages/threads/${activeId}/typing`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ typing: true }) }).catch(()=>{});
                }
              }} onBlur={()=>{ if(activeId){ fetch(`/api/messages/threads/${activeId}/typing`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ typing: false }) }).catch(()=>{}); } }} onKeyDown={(e)=>{ if(e.key==='Enter') send(); }} placeholder="Type a message..." />
              <Button onClick={send} disabled={!msg.trim() || sending}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <NewMessageDialog open={newOpen} onOpenChange={setNewOpen} onSelect={startWithUser} fetchUsers={fetchPeople} />
    </div>
  );
}
