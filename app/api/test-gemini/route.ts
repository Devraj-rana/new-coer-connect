import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ 
        success: false, 
        error: 'Gemini API key not configured' 
      }, { status: 400 });
    }

    const prompt = `Test message: ${message}. Please respond with "API is working correctly!" if you can read this.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: `API Error: ${response.status} - ${errorText}` 
      }, { status: response.status });
    }

    const data = await response.json();
    const botResponse = data.candidates[0].content.parts[0].text;
    
    return NextResponse.json({ 
      success: true, 
      response: botResponse 
    });

  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
