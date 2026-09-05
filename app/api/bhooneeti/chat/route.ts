import { NextResponse } from 'next/server';
import { askGemini } from '@/app/api/services/geminiService';
import { generateEmbedding } from '@/app/api/services/embeddingService';

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log('[BHOONEETI] request received');
  
  try {
    const hasKey = !!process.env.GEMINI_API_KEY;
    console.log(`[BHOONEETI] API key present: ${hasKey}`);
    console.log(`[BHOONEETI] model: ${process.env.GEMINI_MODEL || "gemini-3.1-flash-lite"}`);

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

    console.log('[BHOONEETI] calling Embedding service for the user query');
    const queryEmbedding = await generateEmbedding(message, "RETRIEVAL_QUERY");
    console.log(`[RETRIEVAL] Note: Semantic document retrieval is not yet connected because no evidence/vector store is currently configured.`);
    
    // In the future: const retrievedDocuments = await performSearch(queryEmbedding);
    // message = buildPromptWithContext(message, retrievedDocuments);

    console.log('[BHOONEETI] calling Gemini for generation');
    const answer = await askGemini(message);
    console.log('[BHOONEETI] Gemini response received');
    
    const duration = Date.now() - startTime;
    console.log(`[BHOONEETI] completed in ${duration}ms`);
    
    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[BHOONEETI_GEMINI] Gemini request failed');
    console.error('[BHOONEETI_GEMINI] error:', error.message || String(error));
    console.log(`[BHOONEETI_GEMINI] failed in ${duration}ms`);
    
    const isRateLimit = error.status === 429 || error.message?.includes('429');
    const status = isRateLimit ? 429 : 500;
    
    const errStr = String(error.message || error).toLowerCase();
    let safeMessage = "Unable to reach BhooNeeti's AI service right now. Please try again.";
    if (isRateLimit || errStr.includes("rate limit") || errStr.includes("too many requests")) {
      safeMessage = "Rate limit exceeded. Please try again later.";
    } else if (errStr.includes("not found") || errStr.includes("model")) {
      safeMessage = "The AI model is currently unavailable or misconfigured.";
    } else if (errStr.includes("api key") || errStr.includes("unauthenticated")) {
      safeMessage = "AI service configuration error.";
    } else {
      safeMessage = `AI service encountered an error: ${error.message ? error.message.split('\\n')[0].substring(0, 100) : 'Unknown error'}`;
    }
    
    // Ensure no API key is exposed in the safe message just in case
    const key = process.env.GEMINI_API_KEY;
    if (key && safeMessage.includes(key)) {
      safeMessage = safeMessage.replace(key, '[REDACTED]');
    }

    return NextResponse.json(
      { success: false, error: safeMessage },
      { status }
    );
  }
}
