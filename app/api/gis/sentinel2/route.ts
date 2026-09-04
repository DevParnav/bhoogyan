import { NextResponse } from 'next/server';
import { Sentinel2Service, GeoJsonFeature, Sentinel2SearchOptions } from '../../services/sentinel2Service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract AOI and optional options
    const aoi: GeoJsonFeature = body.aoi;
    const options: Sentinel2SearchOptions = body.options || {};

    if (!aoi) {
      return NextResponse.json({ error: 'Missing AOI geometry in request.' }, { status: 400 });
    }

    if (aoi.type !== 'Feature' || !aoi.geometry || aoi.geometry.type !== 'Polygon') {
      return NextResponse.json({ error: 'Malformed AOI. Expected a GeoJSON Feature with a Polygon geometry.' }, { status: 400 });
    }

    const result = await Sentinel2Service.getAvailableImagery(aoi, options);
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[SENTINEL2 API] Error:', error.message);
    // Determine status based on error type or message if needed
    const status = error.message.includes('Invalid AOI') || error.message.includes('Unsupported geometry') ? 400 : 500;
    return NextResponse.json({ error: error.message || 'Internal server error processing Sentinel-2 preparation' }, { status });
  }
}
