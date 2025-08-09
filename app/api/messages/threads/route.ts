import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import { Conversation } from '@/models/conversation.model';
import { Message } from '@/models/message.model';
import { UserProfile } from '@/models/userProfile.model';

// GET /api/messages/threads -> list current user's DM threads
export async function GET() {
  try {
    await connectDB();
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = user.id;
    const threads = await Conversation.find({ participants: me }).sort({ updatedAt: -1 }).lean();

    const results = await Promise.all(threads.map(async (t: any) => {
      const otherId = (t.participants as string[]).find((p: string) => p !== me);
      const other = otherId ? await UserProfile.findOne({ userId: otherId }).lean() : null;
      const unread = await Message.countDocuments({ conversationId: t._id, senderId: { $ne: me }, readBy: { $ne: me } });
      return {
        _id: t._id,
        participants: t.participants,
        lastMessage: t.lastMessage || '',
        lastSenderId: t.lastSenderId || null,
        updatedAt: t.updatedAt,
        otherUser: other ? {
          userId: other.userId,
          firstName: other.firstName,
          lastName: other.lastName,
          profilePhoto: other.profilePhoto,
          role: other.role,
        } : null,
        unread,
      };
    }));

    return NextResponse.json({ threads: results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list threads' }, { status: 500 });
  }
}

// POST /api/messages/threads -> { recipientId } create or get a DM thread with recipient
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const me = user.id;
    const { recipientId } = await req.json();
    if (!recipientId || typeof recipientId !== 'string') {
      return NextResponse.json({ error: 'recipientId is required' }, { status: 400 });
    }
    if (recipientId === me) return NextResponse.json({ error: 'Cannot start a chat with yourself' }, { status: 400 });

    // Ensure recipient exists
    const recipientProfile = await UserProfile.findOne({ userId: recipientId }).lean();
    if (!recipientProfile) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });

    // Find existing DM
    let convo = await Conversation.findOne({ participants: { $all: [me, recipientId] } }).lean();
    if (!convo) {
      const created = await Conversation.create({ participants: [me, recipientId] });
      convo = JSON.parse(JSON.stringify(created));
    }

    return NextResponse.json({ threadId: (convo as any)._id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create/get thread' }, { status: 500 });
  }
}
