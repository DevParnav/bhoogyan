import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';


export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[CHANGE_VALIDATE] request received at', new Date().toISOString());
  try {
    const body = await request.json();
    const { beforeFilePath, afterFilePath } = body;

    if (!beforeFilePath || !afterFilePath) {
      return NextResponse.json(
        { error: 'Both beforeFilePath and afterFilePath must be provided.' },
        { status: 400 }
      );
    }

    // Ensure paths are within the OS temporary directory
    const absBefore = path.resolve(beforeFilePath);
    const absAfter = path.resolve(afterFilePath);
    const tmpDir = path.join(os.tmpdir(), 'bhoogyan');
    await fs.mkdir(tmpDir, { recursive: true });
    // Case-insensitive comparison for Windows compatibility
    const normalizedBefore = absBefore.toLowerCase();
    const normalizedAfter = absAfter.toLowerCase();
    const normalizedTmp = tmpDir.toLowerCase();
    if (!normalizedBefore.startsWith(normalizedTmp) || !normalizedAfter.startsWith(normalizedTmp)) {
      return NextResponse.json(
        { error: 'Invalid file paths.' },
        { status: 400 }
      );
    }

    const scriptPath = path.join(process.cwd(), 'app', 'api', 'services', 'validate_pair.py');
  console.log('[CHANGE_VALIDATE] beforeFilePath:', beforeFilePath);
  console.log('[CHANGE_VALIDATE] afterFilePath:', afterFilePath);
    console.log('[CHANGE_VALIDATE] starting validation script');
    console.log('[CHANGE_VALIDATE] validating BEFORE scene');
    console.log('[CHANGE_VALIDATE] validating AFTER scene');

    const validationStart = Date.now();
    const result = await new Promise((resolve, reject) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const pythonProcess = spawn('python', [scriptPath, absBefore, absAfter]);
      
      let dataString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      pythonProcess.on('close', (code) => {
        clearTimeout(timeoutId);
        if (code !== 0) {
          console.error('[CHANGE_VALIDATE] Validation script exited with code', code, errorString);

          console.error(`changeDetection.py exited with code ${code}`, errorString);
          reject(new Error(errorString || 'Validation script failed'));
          return;
        }

        try {
          // Parse JSON output from stdout
          const jsonMatch = dataString.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            resolve(parsed);
          } else {
            reject(new Error("Could not parse change detection response: " + dataString));
          }
          // Cleanup temporary files
        } catch (e) {
          reject(e);
        }
      });
    });

    console.log('[CHANGE_VALIDATE] validation script completed in', Date.now() - validationStart, 'ms');
  console.log('[CHANGE_VALIDATE] total request time', Date.now() - startTime, 'ms');
    const parsedResult = result as any;

    if (!parsedResult.success) {
    console.error('[CHANGE_VALIDATE] Validation failed', parsedResult);

      return NextResponse.json(
        { error: parsedResult.error || 'Validation failed.' },
        { status: 400 }
      );
    }

    console.log('[CHANGE_VALIDATE] completed in', Date.now() - startTime, 'ms');
    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error('[CHANGE_VALIDATE] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Validation failed. Please try again.' },
      { status: 500 }
    );
  }

}
