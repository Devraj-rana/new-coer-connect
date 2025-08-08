import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import { Story } from '@/models/story.model';
import { UserProfile } from '@/models/userProfile.model';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const story = await Story.findById(params.id).lean();
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    // Only the owner can see detailed viewers list
    if (story.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const viewers = (story.viewers || []) as Array<{ userId: string; viewedAt: Date }>;
    const viewerIds = viewers.map(v => v.userId);
    const profiles = await UserProfile.find({ userId: { $in: viewerIds } })
      .select('userId firstName lastName profilePhoto')
      .lean();

    const map = new Map(profiles.map((p: any) => [p.userId, p]));

    const result = viewers
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
      .map(v => {
        const p: any = map.get(v.userId);
        return {
          userId: v.userId,
          viewedAt: v.viewedAt,
          firstName: p?.firstName || '',
          lastName: p?.lastName || '',
          profilePhoto: p?.profilePhoto || '/default-avator.png',
        };
      });

    return NextResponse.json({ viewers: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 });
  }
}
