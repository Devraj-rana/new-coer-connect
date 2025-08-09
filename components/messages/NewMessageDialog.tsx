"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import Image from 'next/image';

interface UserItem {
  userId: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  role: 'student' | 'teacher' | 'admin';
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSelect: (userId: string) => void;
  fetchUsers: (query: string) => Promise<UserItem[]>;
}

export default function NewMessageDialog({ open, onOpenChange, onSelect, fetchUsers }: Props) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UserItem[]>([]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      try { const r = await fetchUsers(q); if (!ignore) setResults(r); } finally { setLoading(false); }
    };
    run();
    return () => { ignore = true; };
  }, [q, fetchUsers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search people..." className="pl-9" />
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-sm text-gray-500 py-6 text-center">Searching...</div>
            ) : results.length === 0 ? (
              <div className="text-sm text-gray-500 py-6 text-center">No results</div>
            ) : (
              <ul className="divide-y">
                {results.map(u => (
                  <li key={u.userId}>
                    <button className="w-full flex items-center gap-3 py-2 hover:bg-gray-50 px-2 rounded" onClick={()=>onSelect(u.userId)}>
                      <Image src={u.profilePhoto || '/default-avator.png'} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-gray-500 capitalize">{u.role}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
