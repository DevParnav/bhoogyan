import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ndviChangePath, threshold } = body;

    if (!ndviChangePath) {
      return NextResponse.json(
        { error: 'ndviChangePath must be provided.' },
        { status: 400 }
      );
    }

    const absPath = path.resolve(ndviChangePath);
    const tmpDir = path.join(os.tmpdir(), 'bhoogyan');
    // Case-insensitive comparison for Windows compatibility
    if (!absPath.toLowerCase().startsWith(tmpDir.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file path.' },
        { status: 400 }
      );
    }

    const t = threshold !== undefined ? Number(threshold) : 0.15;
    if (isNaN(t) || t < 0) {
      return NextResponse.json(
        { error: 'Invalid threshold.' },
        { status: 400 }
      );
    }

    // Generate output path for the categorical change raster
    const outputFileName = `change_classified_${crypto.randomUUID()}.tiff`;
    const outputPath = path.join(tmpDir, outputFileName);

    const scriptPath = path.join(process.cwd(), 'app', 'api', 'services', 'classifyChange.py');

    const result = await new Promise((resolve, reject) => {
      // Set high maxBuffer if the base64 string gets large, though 64x64/256x256 shouldn't exceed 1MB.
      const pythonProcess = spawn('python', [scriptPath, absPath, t.toString(), outputPath]);
      
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
          console.error(`classifyChange.py exited with code ${code}`, errorString);
          reject(new Error(errorString || 'Classification script failed'));
          return;
        }

        try {
          // Parse JSON output from stdout
          const jsonMatch = dataString.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            resolve(parsed);
          } else {
            reject(new Error("Could not parse classification response: " + dataString));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    const parsedResult = result as any;

    if (!parsedResult.success) {
      return NextResponse.json(
        { error: parsedResult.error || 'Change classification failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error('Change Classify Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Change classification failed. Please try again.' },
      { status: 500 }
    );
  }
}
