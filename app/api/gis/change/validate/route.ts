import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';


export async function POST(request: NextRequest) {
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
    if (!absBefore.startsWith(tmpDir) || !absAfter.startsWith(tmpDir)) {
      return NextResponse.json(
        { error: 'Invalid file paths.' },
        { status: 400 }
      );
    }

    const scriptPath = path.join(process.cwd(), 'app', 'api', 'services', 'validate_pair.py');
    const result = await new Promise((resolve, reject) => {
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
        if (code !== 0) {
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

    const parsedResult = result as any;

    if (!parsedResult.success) {
      return NextResponse.json(
        { error: parsedResult.error || 'Validation failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error('Validation Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Validation failed. Please try again.' },
      { status: 500 }
    );
  }
}
