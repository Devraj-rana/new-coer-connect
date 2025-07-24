import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Gemini API key not configured');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('🤖 Processing chat message:', message.substring(0, 50) + '...');

    // Try the main API endpoint first
    let response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a friendly, helpful AI assistant. Please provide a warm, conversational response to: "${message}"

Be friendly, engaging, and helpful. You can discuss any topic - technology, life advice, hobbies, careers, or anything else. Keep your tone casual and approachable, like talking to a friend. Use emojis occasionally to make the conversation engaging.

User's message: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });
    } catch (error) {
      console.log('🔄 Main API failed, trying beta endpoint...');
      
      // Fallback to beta endpoint
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a friendly AI assistant. Please respond warmly and helpfully to: "${message}"`
            }]
          }]
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', response.status, errorText);
      
      // Return intelligent fallback based on message content
      const intelligentFallback = getIntelligentFallback(message);
      return NextResponse.json({ 
        response: intelligentFallback,
        fallback: true 
      });
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ No candidates in response:', data);
      const intelligentFallback = getIntelligentFallback(message);
      return NextResponse.json({ 
        response: intelligentFallback,
        fallback: true 
      });
    }

    const botResponse = data.candidates[0].content.parts[0].text;
    
    console.log('✅ Successfully generated response');
    return NextResponse.json({ 
      response: botResponse,
      fallback: false 
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    
    const { message } = await request.json().catch(() => ({ message: 'hello' }));
    const intelligentFallback = getIntelligentFallback(message);
    
    return NextResponse.json({ 
      response: intelligentFallback,
      fallback: true 
    });
  }
}

function getIntelligentFallback(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello there! 👋 Nice to meet you! I'm your friendly AI assistant. What would you like to chat about today?";
  } else if (msg.includes('how are you') || msg.includes('how r u')) {
    return "I'm doing great, thank you for asking! 😊 I'm here and ready to help with whatever you need. How are you doing today?";
  } else if (msg.includes('what') && (msg.includes('name') || msg.includes('who are you'))) {
    return "I'm your friendly AI assistant! 🤖 I'm here to help with any questions or have a chat about whatever interests you. What would you like to know?";
  } else if (msg.includes('help') || msg.includes('assist')) {
    return "I'd be happy to help you! 💪 I can assist with a wide variety of topics - technology, career advice, general questions, or just have a friendly conversation. What do you need help with?";
  } else if (msg.includes('resume') || msg.includes('job') || msg.includes('career')) {
    return "Great question about careers! 📄 For resumes, focus on: using relevant keywords, quantifying your achievements with numbers, keeping formatting clean and ATS-friendly, and tailoring content for each job. What specific aspect would you like to know more about?";
  } else if (msg.includes('code') || msg.includes('program') || msg.includes('tech') || msg.includes('software')) {
    return "I love talking about technology! 💻 Whether it's coding best practices, learning new technologies, or solving technical problems, I'm here to help. What specific tech topic interests you?";
  } else if (msg.includes('thanks') || msg.includes('thank you')) {
    return "You're very welcome! 😊 I'm always happy to help. Is there anything else you'd like to chat about or any other questions I can assist with?";
  } else {
    return `That's an interesting question! 🤔 I'd love to help you with "${message}". While I'm processing your request, feel free to tell me more about what you're looking for, and I'll do my best to provide a helpful response!`;
  }
}
