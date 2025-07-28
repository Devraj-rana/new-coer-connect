import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';

export async function GET() {
  try {
    const connection = await connectDB();
    
    if (connection) {
      return NextResponse.json({ 
        success: true,
        message: 'Database connected successfully!',
        database: typeof connection === 'object' ? connection.name || 'Connected' : 'Connected'
      });
    } else {
      return NextResponse.json({ 
        success: false,
        message: 'Failed to connect to database'
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      message: 'Database connection failed',
      error: error.message
    }, { status: 500 });
  }
}
