"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { readFileAsDataUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StoryDoc {
  _id: string;
  userId: string;
  mediaUrl: string;
  type: 'image'|'video';
  textOverlay?: string;
  createdAt: string;
  viewers?: { userId: string; viewedAt: string }[];
}

export default function StoriesBar() {
  const [stories, setStories] = useState<StoryDoc[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const res = await fetch('/api/stories', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setStories(data);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const res = await fetch('/api/stories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mediaUrl: dataUrl, type }) });
      if (res.ok) {
        await load();
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto">
        <label className="flex-none inline-flex items-center justify-center w-24 h-36 rounded-xl border border-dashed cursor-pointer hover:bg-muted/50">
          <input type="file" accept="image/*,video/*" className="hidden" onChange={onPick} />
          <span className="text-sm">{uploading ? 'Uploading…' : 'Add Story'}</span>
        </label>
        {stories.map((s)=> (
          <div key={s._id} className="flex-none w-24 h-36 relative rounded-xl overflow-hidden bg-muted">
            {s.type === 'image' ? (
              <Image src={s.mediaUrl} alt="story" fill className="object-cover" />
            ) : (
              <video src={s.mediaUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
            )}
            {s.textOverlay && (
              <div className="absolute bottom-0 left-0 right-0 text-xs p-1 bg-black/40 text-white line-clamp-2">{s.textOverlay}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
