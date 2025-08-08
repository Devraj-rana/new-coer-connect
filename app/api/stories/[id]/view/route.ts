import { NextResponse } from 'next/server';
import { addViewer } from '@/lib/storyActions';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await addViewer(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 400 });
  }
}
