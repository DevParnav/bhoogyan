import { NextResponse } from 'next/server';
import { askGemini } from '@/app/api/services/geminiService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid or missing message' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ success: false, error: 'Message too long' }, { status: 400 });
    }

    const answer = await askGemini(message);
    
    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    console.error('BhooNeeti Chat API Error:', error);
    
    // Return a safe error message to the client
    return NextResponse.json(
      { success: false, error: 'Unable to reach BhooNeeti\'s AI service right now. Please try again.' },
      { status: 500 }
    );
  }
}
