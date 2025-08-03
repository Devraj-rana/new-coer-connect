import { NextResponse } from 'next/server';
import { getTrendingPosts } from '@/lib/dashboardActions';

export async function GET() {
  try {
    const trendingPosts = await getTrendingPosts();
    return NextResponse.json({ 
      success: true, 
      data: trendingPosts,
      count: trendingPosts.length 
    });
  } catch (error) {
    console.error('Error in test-trending endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
