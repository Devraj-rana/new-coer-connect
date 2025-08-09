import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import { UserProfile } from '@/models/userProfile.model';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await currentUser();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();

    const query: any = {};
    // Exclude the requesting user
    if (user?.id) {
      query.userId = { $ne: user.id };
    }

    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { position: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { skills: { $elemMatch: { $regex: q, $options: 'i' } } },
      ];
    }

    const users = await UserProfile.find(query)
      .select('userId firstName lastName profilePhoto role')
      .limit(20)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ results: users });
  } catch (e: any) {
    console.error('People search failed:', e);
    return NextResponse.json({ error: e.message || 'Failed to search' }, { status: 500 });
  }
}
