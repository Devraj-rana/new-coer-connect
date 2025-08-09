import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import { Conversation } from '@/models/conversation.model';
import { Message } from '@/models/message.model';

// POST /api/messages/threads/[threadId]/read -> mark all as read for current user
export async function POST(_req: NextRequest, { params }: { params: { threadId: string } }) {
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

    await Message.updateMany({ conversationId: (convo as any)._id, readBy: { $ne: me } }, { $addToSet: { readBy: me } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to mark as read' }, { status: 500 });
  }
}
