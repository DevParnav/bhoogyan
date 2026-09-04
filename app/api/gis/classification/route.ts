import { NextRequest, NextResponse } from 'next/server';
import { LulcModelService } from '../../services/lulcModelService';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let fileBlob: any;
    let fileName = 'image.tif';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (!body.filePath) {
        return NextResponse.json({ error: 'No filePath provided.' }, { status: 400 });
      }
      
      const absolutePath = path.resolve(body.filePath);
      
      try {
        const buffer = await fs.readFile(absolutePath);
        fileBlob = new Blob([buffer], { type: 'image/tiff' });
        fileName = path.basename(absolutePath);
        // Next.js File emulation hack since lulcModelService expects a file with a name property
        fileBlob.name = fileName;
      } catch (err) {
        return NextResponse.json({ error: 'Failed to read the validated TIFF from the server.' }, { status: 500 });
      }
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided. Please upload a valid TIFF image.' },
          { status: 400 }
        );
      }

      const fName = file.name.toLowerCase();
      const isValidType = fName.endsWith('.tif') || fName.endsWith('.tiff') || file.type.includes('tiff') || file.type.includes('tif');
      
      if (!isValidType) {
        return NextResponse.json(
          { error: 'Invalid file format. Only .tif and .tiff files are supported.' },
          { status: 400 }
        );
      }
      
      fileBlob = file;
    }

    const result = await LulcModelService.classifyLandCover(fileBlob);
    console.log('[CLASSIFICATION] model response received');
    
    console.log('[CLASSIFICATION] response returned');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('LULC Classification Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Land cover classification failed. Please try again.' },
      { status: 500 }
    );
  }
}
