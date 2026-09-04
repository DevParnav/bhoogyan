import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import crypto from 'crypto';

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

    // Ensure paths are within our tmp directory
    const absBefore = path.resolve(beforeFilePath);
    const absAfter = path.resolve(afterFilePath);

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!absBefore.startsWith(tmpDir) || !absAfter.startsWith(tmpDir)) {
      return NextResponse.json(
        { error: 'Invalid file paths.' },
        { status: 400 }
      );
    }

    // Generate output path for the continuous NDVI change raster
    const outputFileName = `change_ndvi_${crypto.randomUUID()}.tiff`;
    const outputPath = path.join(tmpDir, outputFileName);

    const scriptPath = path.join(process.cwd(), 'app', 'api', 'services', 'changeDetection.py');

    const result = await new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [scriptPath, absBefore, absAfter, outputPath]);
      
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
          reject(new Error(errorString || 'Change detection script failed'));
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
        } catch (e) {
          reject(e);
        }
      });
    });

    const parsedResult = result as any;

    if (!parsedResult.success) {
      return NextResponse.json(
        { error: parsedResult.error || 'Change detection failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error('Change Detection Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Change detection failed. Please try again.' },
      { status: 500 }
    );
  }
}
