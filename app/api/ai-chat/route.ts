import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const deepseekApiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
    
    if (!deepseekApiKey || deepseekApiKey === 'your_deepseek_api_key_here') {
      console.error('❌ DeepSeek API key not configured, using fallback');
      return NextResponse.json({ 
        response: getFallbackResponse(message),
        fallback: true 
      });
    }

    console.log('🤖 Processing chat message with DeepSeek:', message.substring(0, 50) + '...');

    // DeepSeek API call
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful, friendly AI assistant. Provide concise, informative responses. Be conversational and engaging.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      }),
    });

    if (!response.ok) {
      console.error('❌ DeepSeek API Error:', response.status, await response.text());
      const fallbackResponse = getFallbackResponse(message);
      console.log('📤 Returning fallback response:', fallbackResponse.substring(0, 50) + '...');
      
      return NextResponse.json({ 
        response: fallbackResponse,
        fallback: true 
      });
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error('❌ No choices in DeepSeek response');
      const fallbackResponse = getFallbackResponse(message);
      console.log('📤 Returning fallback response:', fallbackResponse.substring(0, 50) + '...');
      
      return NextResponse.json({ 
        response: fallbackResponse,
        fallback: true 
      });
    }

    const botResponse = data.choices[0].message?.content;
    
    if (!botResponse) {
      console.error('❌ Empty response from DeepSeek');
      const fallbackResponse = getFallbackResponse(message);
      console.log('📤 Returning fallback response:', fallbackResponse.substring(0, 50) + '...');
      
      return NextResponse.json({ 
        response: fallbackResponse,
        fallback: true 
      });
    }

    console.log('✅ Successfully generated DeepSeek response');
    return NextResponse.json({ 
      response: botResponse,
      fallback: false 
    });

  } catch (error) {
    console.error('❌ DeepSeek Chat API Error:', error);
    
    const { message } = await request.json().catch(() => ({ message: 'hello' }));
    const fallbackResponse = getFallbackResponse(message);
    console.log('📤 Returning fallback response due to error:', fallbackResponse.substring(0, 50) + '...');
    
    return NextResponse.json({ 
      response: fallbackResponse,
      fallback: true 
    });
  }
}

function getFallbackResponse(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello! 👋 How can I help you today?";
  } else if (msg.includes('how are you')) {
    return "I'm doing well, thank you for asking! How are you?";
  } else if (msg.includes('name')) {
    return "I'm your AI assistant powered by DeepSeek! What's your name?";
  } else if (msg.includes('help')) {
    return "I'm here to help! What do you need assistance with?";
  } else if (msg.includes('bye') || msg.includes('goodbye')) {
    return "Goodbye! Have a great day! 👋";
  } else if (msg.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with?";
  } else if (msg.includes('weather')) {
    return "I don't have access to real-time weather data, but you can check your local weather forecast online!";
  } else if (msg.includes('time')) {
    return "I don't have access to the current time, but you can check it on your device!";
  } else if (msg.includes('joke')) {
    return "Why don't scientists trust atoms? Because they make up everything! 😄";
  } else if (msg.includes('water') && msg.includes('formula')) {
    return "The chemical formula for water is H2O - that's two hydrogen atoms and one oxygen atom! 🧪";
  } else if (msg.includes('resume') || msg.includes('job')) {
    return "For resume tips: Keep it concise, highlight achievements, use action verbs, and tailor it to each job. Good luck with your job search! 💼";
  } else {
    return "That's an interesting question! I'm still learning, but I'd be happy to chat about it. Can you tell me more? 🤔";
  }
}
