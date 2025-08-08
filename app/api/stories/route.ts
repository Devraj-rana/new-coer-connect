import { NextResponse } from 'next/server';
import { createStory, getStoriesFeed, addViewer, deleteExpiredStories } from '@/lib/storyActions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const story = await createStory({ mediaUrl: body.mediaUrl, type: body.type, textOverlay: body.textOverlay });
    return NextResponse.json(story);
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 });
  }
}

export async function GET() {
  try {
    await deleteExpiredStories();
    const stories = await getStoriesFeed();
    return NextResponse.json(stories);
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 });
  }
}
