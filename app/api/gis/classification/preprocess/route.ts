import { NextResponse } from 'next/server';
import { LulcPreprocessingService } from '../../../services/lulcPreprocessingService';
import fs from 'fs/promises';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inputFile = body.inputFile;

    if (!inputFile) {
      return NextResponse.json({ error: 'Missing inputFile parameter.' }, { status: 400 });
    }
    
    // Quick security check to avoid arbitrary command injection via filename
    if (inputFile.includes(';') || inputFile.includes('&') || inputFile.includes('|')) {
      return NextResponse.json({ error: 'Invalid inputFile path.' }, { status: 400 });
    }

    try {
      await fs.access(inputFile);
    } catch {
      return NextResponse.json({ error: 'Input file not found on server.' }, { status: 404 });
    }

    // Process the TIFF
    const result = await LulcPreprocessingService.preprocessTiff(inputFile);

    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[PREPROCESS API] Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal server error during preprocessing' }, { status: 500 });
  }
}
