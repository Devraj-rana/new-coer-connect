import { NextResponse } from 'next/server';
import { purgeScheduledDeletions } from '@/lib/profileActions';

export async function GET() {
  try {
    await purgeScheduledDeletions();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}
