import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import { Conversation } from '@/models/conversation.model';

export async function GET(_req: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    await connectDB();
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const convo = await Conversation.findById(params.threadId).lean();
    if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!convo.participants?.includes(user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const typingUserIds: string[] = (convo.typingUsers || []).filter((id: string) => id !== user.id);
    return NextResponse.json({ typingUserIds });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    await connectDB();
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { typing } = await req.json();
    const convo = await Conversation.findById(params.threadId);
    if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!convo.participants?.includes(user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const set = new Set<string>((convo.typingUsers as string[]) || []);
    if (typing) set.add(user.id); else set.delete(user.id);
    convo.typingUsers = Array.from(set);
    convo.typingUpdatedAt = new Date();
    await convo.save();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
