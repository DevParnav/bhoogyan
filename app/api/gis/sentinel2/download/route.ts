import { NextResponse } from 'next/server';
import { Sentinel2Service, GeoJsonFeature, Scene } from '../../../services/sentinel2Service';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const aoi: GeoJsonFeature = body.aoi;
    const scene: Scene = body.scene;

    if (!aoi) {
      return NextResponse.json({ error: 'Missing AOI geometry.' }, { status: 400 });
    }
    if (!scene || !scene.id) {
      return NextResponse.json({ error: 'Missing scene selection.' }, { status: 400 });
    }

    // Call service to authenticate and download via Copernicus Process API
    const result = await Sentinel2Service.downloadScene(aoi, scene);
    
    // Save to a temporary server-side location
    const tempDir = path.join(process.cwd(), 'tmp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const safeSceneId = scene.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const hash = crypto.randomBytes(4).toString('hex');
    const fileName = `s2_${safeSceneId}_${hash}.tif`;
    const filePath = path.join(tempDir, fileName);
    
    await fs.writeFile(filePath, result.buffer);

    return NextResponse.json({
      success: true,
      file: filePath,
      metadata: result.metadata,
      scene: scene
    });
    
  } catch (error: any) {
    console.error('[SENTINEL2 DOWNLOAD API] Error:', error.message);
    const status = error.message.includes('Invalid') ? 400 : 500;
    return NextResponse.json({ error: error.message || 'Internal server error during download' }, { status });
  }
}
