import { NextResponse } from 'next/server';
import { BhuvanLulcAoiWiseService } from '../../../../api/services/bhuvanLulcAoiWiseService';

export async function POST(request: Request) {
  try {
    const geoJson = await request.json();

    if (!geoJson || geoJson.type !== 'FeatureCollection' && geoJson.type !== 'Feature') {
      return NextResponse.json(
        { error: 'Invalid GeoJSON payload provided.' },
        { status: 400 }
      );
    }

    const result = await BhuvanLulcAoiWiseService.analyzeAoi(geoJson);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Bhuvan LULC API Error: Failed to analyze AOI.');
    return NextResponse.json(
      { error: 'Satellite data could not be retrieved. Please try again.' },
      { status: 500 }
    );
  }
}
