import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import { Conversation } from '@/models/conversation.model';
import { Message } from '@/models/message.model';

// GET /api/messages/threads/[threadId]/messages -> list messages (participant only)
export async function GET(_req: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    await connectDB();
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const me = user.id;
    const { threadId } = params;

    const convo = await Conversation.findById(threadId).lean();
    if (!convo || !(convo.participants as string[]).includes(me)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const messages = await Message.find({ conversationId: (convo as any)._id }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ messages });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load messages' }, { status: 500 });
  }
}

// POST /api/messages/threads/[threadId]/messages -> { content } send message (participant only)
export async function POST(req: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    await connectDB();
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const me = user.id;
    const { threadId } = params;
    const { content } = await req.json();
    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const convo = await Conversation.findById(threadId);
    if (!convo || !convo.participants.includes(me)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const msg = await Message.create({ conversationId: convo._id, senderId: me, content: content.trim(), readBy: [me] });
    convo.lastMessage = content.trim();
    convo.lastSenderId = me;
    await convo.save();

    return NextResponse.json({ message: JSON.parse(JSON.stringify(msg)) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to send message' }, { status: 500 });
  }
}
