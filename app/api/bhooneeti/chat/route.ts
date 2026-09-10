import { NextResponse } from 'next/server';
import { askGemini } from '@/app/api/services/geminiService';

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log('[BHOONEETI] request received');
  
  try {
    const hasKey = !!process.env.GEMINI_API_KEY;
    console.log(`[BHOONEETI] API key present: ${hasKey}`);
    console.log(`[BHOONEETI] Model: ${process.env.GEMINI_MODEL || "gemini-3.1-flash-lite"}`);

    if (!hasKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error: Missing API Key' }, { status: 500 });
    }

    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid or missing message' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ success: false, error: 'Message too long' }, { status: 400 });
    }

    console.log('[BHOONEETI] calling Gemini');
    const answer = await askGemini(message);
    console.log('[BHOONEETI] Gemini response received');
    
    const duration = Date.now() - startTime;
    console.log(`[BHOONEETI] completed in ${duration}ms`);
    
    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[BHOONEETI] Gemini request failed');
    console.error('[BHOONEETI] error:', error.message || String(error));
    console.log(`[BHOONEETI] failed in ${duration}ms`);
    
    const isRateLimit = error.status === 429 || error.message?.includes('429');
    const status = isRateLimit ? 429 : 500;
    
    return NextResponse.json(
      { success: false, error: "Unable to reach BhooNeeti's AI service right now. Please try again." },
      { status }
    );
  }
}
