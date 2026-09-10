import { NextRequest, NextResponse } from 'next/server';
import { Sentinel2Service } from '../../../services/sentinel2Service';
import { LulcModelService } from '../../../services/lulcModelService';
import { EvidenceService } from '../../../services/evidenceService';

export const maxDuration = 60; // Increase max duration for this endpoint

function calculatePolygonAreaSqKm(geometry: any): number {
  if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates?.[0]) return 0;
  const ring = geometry.coordinates[0];
  if (ring.length < 3) return 0;

  const R = 6371; // Earth radius in km
  let total = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [lon1, lat1] = ring[i];
    const [lon2, lat2] = ring[i + 1];
    const radLat1 = (lat1 * Math.PI) / 180;
    const radLat2 = (lat2 * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    total += dLon * (2 + Math.sin(radLat1) + Math.sin(radLat2));
  }
  total = (Math.abs(total) * R * R) / 2;
  return total;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aoi, scene } = body;

    if (!aoi || !scene) {
      return NextResponse.json({ error: 'Both AOI and scene are required.' }, { status: 400 });
    }

    const totalAreaSqKm = calculatePolygonAreaSqKm(aoi.geometry);
    const totalAreaHa = totalAreaSqKm * 100;

    // 1. Download Sentinel-2 scene as Buffer
    console.log('[CLASSIFICATION] --- PIPELINE LOGGING ---');
    console.log(`[CLASSIFICATION] Scene ID: ${scene.id || 'unknown'}`);
    console.log(`[CLASSIFICATION] Scene Date: ${scene.date || 'unknown'}`);
    console.log(`[CLASSIFICATION] Cloud Coverage: ${scene.cloudCoverage}%`);
    console.log(`[CLASSIFICATION] AOI Calculated Area: ${totalAreaSqKm.toFixed(3)} sq km (${totalAreaHa.toFixed(1)} ha)`);

    let downloadResult;
    try {
      downloadResult = await Sentinel2Service.downloadScene(aoi, scene);
    } catch (err: any) {
      console.error('[CLASSIFICATION] Sentinel-2 download failed:', err);
      return NextResponse.json({ error: `Sentinel-2 download failed: ${err.message}` }, { status: 502 });
    }

    if (!downloadResult || !downloadResult.buffer) {
      return NextResponse.json({ error: 'Sentinel-2 download returned empty data.' }, { status: 500 });
    }

    console.log(`[CLASSIFICATION] Downloaded GeoTIFF Band Count: ${downloadResult.metadata?.bands} (B1-B12 + SCL)`);
    console.log(`[CLASSIFICATION] Downloaded GeoTIFF Dimensions: ${downloadResult.metadata?.width}x${downloadResult.metadata?.height} @ 20m resolution`);
    console.log(`[CLASSIFICATION] Downloaded GeoTIFF File Size: ${(downloadResult.buffer.length / 1024).toFixed(1)} KB`);

    // 2. Convert Buffer to Blob for the model service
    const fileBlob = new Blob([downloadResult.buffer], { type: 'image/tiff' });
    (fileBlob as any).name = `${scene.id || 'sentinel2'}.tif`;

    // 3. Run Inference
    console.log('[CLASSIFICATION] Sending 13-band GeoTIFF to Hugging Face U-Net model server (bhargav37/lulc-dl-model)...');
    let classificationResult;
    try {
      classificationResult = await LulcModelService.classifyLandCover(fileBlob);
    } catch (err: any) {
      console.error('[CLASSIFICATION] Model inference failed:', err);
      return NextResponse.json({ error: `Model inference failed: ${err.message}` }, { status: 502 });
    }

    console.log('[CLASSIFICATION] Model Inference Status: SUCCESS (200 OK)');
    console.log('[CLASSIFICATION] Returned Class Stats:', JSON.stringify(classificationResult.class_stats));

    const stats = classificationResult.class_stats || {};
    const classAreasHa: Record<string, number> = {};
    for (const [clsName, pct] of Object.entries(stats)) {
      classAreasHa[clsName] = Number((((pct as number) / 100) * totalAreaHa).toFixed(2));
    }

    // Add metadata to response
    classificationResult.source = 'Real Sentinel-2 + LULC U-Net';
    classificationResult.scene = scene;
    classificationResult.total_area_sqkm = Number(totalAreaSqKm.toFixed(3));
    classificationResult.total_area_ha = Number(totalAreaHa.toFixed(1));
    classificationResult.class_areas_ha = classAreasHa;

    // Save real evidence to RAG Store
    try {
      const forestPct = stats['Forest'] ?? 0;
      const cropPct = stats['Crop'] ?? 0;
      const waterPct = stats['Water'] ?? 0;
      const builtUpPct = stats['Built-up_Area'] ?? 0;
      const barrenPct = stats['Barren_Land'] ?? 0;
      const unclassifiedPct = stats['Unclassified'] ?? 0;

      const evidenceText = `Sentinel-2 L2A scene ${scene.id || 'unknown'} acquired on ${scene.date || 'unknown'} for the selected AOI (Total Area: ${totalAreaSqKm.toFixed(2)} sq km / ${totalAreaHa.toFixed(1)} ha, Cloud Cover: ${scene.cloudCoverage}%) produced the following real land-cover classification from the U-Net model (bhargav37/lulc-dl-model):
- Forest: ${forestPct.toFixed(2)}% (${(classAreasHa['Forest'] || 0).toFixed(2)} ha)
- Crop: ${cropPct.toFixed(2)}% (${(classAreasHa['Crop'] || 0).toFixed(2)} ha)
- Water: ${waterPct.toFixed(2)}% (${(classAreasHa['Water'] || 0).toFixed(2)} ha)
- Built-up Area: ${builtUpPct.toFixed(2)}% (${(classAreasHa['Built-up_Area'] || 0).toFixed(2)} ha)
- Barren Land: ${barrenPct.toFixed(2)}% (${(classAreasHa['Barren_Land'] || 0).toFixed(2)} ha)
- Unclassified: ${unclassifiedPct.toFixed(2)}% (${(classAreasHa['Unclassified'] || 0).toFixed(2)} ha)`;

      await EvidenceService.saveEvidence({
        id: `class-${Date.now()}-${scene.id || 'unknown'}`,
        text: evidenceText,
        metadata: {
          source: 'Copernicus Sentinel-2',
          sourceType: 'satellite-analysis',
          sceneId: scene.id || 'unknown',
          analysisType: 'land-cover-classification',
          acquisitionDate: scene.date || 'unknown',
          cloudCoverage: scene.cloudCoverage,
          totalAreaSqKm: totalAreaSqKm,
          model: 'bhargav37/lulc-dl-model',
          classStats: stats,
          classAreasHa: classAreasHa,
          timestamp: new Date().toISOString()
        }
      });
      console.log('[CLASSIFICATION] Successfully indexed real analysis evidence for BhooNeeti RAG.');
    } catch (e) {
      console.error('[CLASSIFICATION] Failed to save evidence chunk', e);
    }

    return NextResponse.json(classificationResult);
  } catch (error: any) {
    console.error('LULC Classification Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Land cover classification failed. Please try again.' },
      { status: 500 }
    );
  }
}

