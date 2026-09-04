import { NextRequest, NextResponse } from 'next/server';
import { Sentinel2Service } from '../../../services/sentinel2Service';
import { LulcModelService } from '../../../services/lulcModelService';

export const maxDuration = 60; // Increase max duration for this endpoint

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aoi, scene } = body;

    if (!aoi || !scene) {
      return NextResponse.json({ error: 'Both AOI and scene are required.' }, { status: 400 });
    }

    // 1. Download Sentinel-2 scene as Buffer
    console.log('[CLASSIFICATION] Downloading Sentinel-2 scene via Copernicus API...');
    let downloadResult;
    try {
      downloadResult = await Sentinel2Service.downloadScene(aoi, scene);
    } catch (err: any) {
      return NextResponse.json({ error: `Sentinel-2 download failed: ${err.message}` }, { status: 502 });
    }

    if (!downloadResult || !downloadResult.buffer) {
      return NextResponse.json({ error: 'Sentinel-2 download returned empty data.' }, { status: 500 });
    }

    // 2. Convert Buffer to Blob for the model service
    const fileBlob = new Blob([downloadResult.buffer], { type: 'image/tiff' });
    // Hack for LulcModelService which expects a name property
    (fileBlob as any).name = `${scene.id || 'sentinel2'}.tif`;

    // 3. Run Inference
    console.log('[CLASSIFICATION] Sending 13-band TIFF to Hugging Face U-Net model...');
    let classificationResult;
    try {
      classificationResult = await LulcModelService.classifyLandCover(fileBlob);
    } catch (err: any) {
      return NextResponse.json({ error: `Model inference failed: ${err.message}` }, { status: 502 });
    }

    console.log('[CLASSIFICATION] Inference completed successfully.');
    
    // Add source metadata
    classificationResult.source = 'Real Sentinel-2 + LULC U-Net';
    classificationResult.scene = scene;

    return NextResponse.json(classificationResult);
  } catch (error: any) {
    console.error('LULC Classification Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Land cover classification failed. Please try again.' },
      { status: 500 }
    );
  }
}
