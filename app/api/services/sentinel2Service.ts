export interface GeoJsonFeature {
  type: string;
  properties?: any;
  geometry: {
    type: string;
    coordinates: any[];
  };
}

export interface Sentinel2SearchOptions {
  dateFrom?: string;
  dateTo?: string;
  maxCloudCoverage?: number;
}

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface Scene {
  id: string;
  date: string;
  cloudCoverage: number;
  productName: string;
  tile: string;
}

let oauthToken: string | null = null;
let tokenExpiry: number | null = null;

export class Sentinel2Service {
  /**
   * Reusable Copernicus OAuth token generation
   */
  static async getCopernicusToken() {
    if (oauthToken && tokenExpiry && Date.now() < tokenExpiry) {
      return oauthToken;
    }

    const clientId = process.env.COPERNICUS_CLIENT_ID;
    const clientSecret = process.env.COPERNICUS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Copernicus Client ID or Secret missing in environment variables.');
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const res = await fetch('https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Copernicus OAuth error: ${res.status} ${text}`);
    }

    const data = await res.json();
    oauthToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return oauthToken;
  }

  /**
   * Calculates the bounding box from a GeoJSON Polygon's coordinates.
   */
  static calculateBoundingBox(geometry: GeoJsonFeature['geometry']): BoundingBox {
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates[0])) {
      const ring = geometry.coordinates[0];
      for (const coord of ring) {
        const [lng, lat] = coord;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    } else {
      throw new Error('Unsupported geometry type for bounding box calculation. Only Polygon is currently supported.');
    }

    return { minLng, minLat, maxLng, maxLat };
  }

  /**
   * Evaluates the AOI and discovers available imagery via Copernicus STAC.
   */
  static async getAvailableImagery(aoi: GeoJsonFeature, options?: Sentinel2SearchOptions) {
    if (!aoi || aoi.type !== 'Feature' || !aoi.geometry || aoi.geometry.type !== 'Polygon') {
      throw new Error('Invalid AOI format. Expected a GeoJSON Feature with a Polygon geometry.');
    }

    const bbox = this.calculateBoundingBox(aoi.geometry);
    
    // Provide sensible defaults if options are missing
    const searchOptions = {
      dateFrom: options?.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      dateTo: options?.dateTo || new Date().toISOString().split('T')[0], // today
      maxCloudCoverage: options?.maxCloudCoverage ?? 20,
    };

    // Public STAC search works without authentication!
    const isProviderConfigured = true; 
    const providerName = "Copernicus Data Space";

    if (process.env.NODE_ENV === 'development') {
      console.log('[SENTINEL2] Searching Copernicus STAC');
      console.log(`[SENTINEL2] Collection: sentinel-2-l2a`);
      console.log(`[SENTINEL2] Date range: ${searchOptions.dateFrom} to ${searchOptions.dateTo}`);
      console.log(`[SENTINEL2] Cloud limit: <= ${searchOptions.maxCloudCoverage}%`);
    }

    // Call the real STAC API
    const stacUrl = 'https://stac.dataspace.copernicus.eu/v1/search';
    
    // Create datetime string required by STAC (e.g. "2026-08-01T00:00:00Z/2026-08-31T23:59:59Z")
    const datetime = `${searchOptions.dateFrom}T00:00:00Z/${searchOptions.dateTo}T23:59:59Z`;

    const payload = {
      collections: ["sentinel-2-l2a"],
      intersects: aoi.geometry, // Search using actual geometry!
      datetime: datetime,
      query: {
        "eo:cloud_cover": {
          "lte": searchOptions.maxCloudCoverage
        }
      },
      sortby: [
        {
          field: "properties.eo:cloud_cover",
          direction: "asc" // Lowest cloud cover first
        }
      ],
      limit: 10
    };

    let stacFeatures: any[] = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const stacRes = await fetch(stacUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!stacRes.ok) {
        const errText = await stacRes.text();
        console.error('[SENTINEL2] STAC Error:', stacRes.status, errText);
        throw new Error(`Copernicus STAC API failure: HTTP ${stacRes.status}`);
      }

      const stacData = await stacRes.json();
      stacFeatures = stacData.features || [];
    } catch (err: any) {
      if (err.name === 'AbortError') throw new Error('Copernicus STAC API timeout');
      throw new Error(`Copernicus STAC API error: ${err.message}`);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[SENTINEL2] Scenes found: ${stacFeatures.length}`);
    }

    // Parse the STAC features into clean Scene objects
    const scenes = stacFeatures.map((f: any) => ({
      id: f.id,
      date: f.properties?.datetime,
      cloudCoverage: f.properties?.['eo:cloud_cover'],
      productName: f.id, // Using ID as productName for S2
      tile: f.properties?.['grid:code'] || 'Unknown'
    }));

    return {
      success: true,
      provider: providerName,
      collection: "sentinel-2-l2a",
      search: searchOptions,
      aoi: {
        geometryType: aoi.geometry.type,
        bbox: [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat]
      },
      count: scenes.length,
      scenes
    };
  }

  /**
   * Downloads the 13-band GeoTIFF using the Sentinel Hub Process API
   */
  static async downloadScene(aoi: GeoJsonFeature, scene: Scene) {
    if (!aoi || aoi.type !== 'Feature' || !aoi.geometry || aoi.geometry.type !== 'Polygon') {
      throw new Error('Invalid AOI format.');
    }
    
    // Ensure we have authentication
    const token = await this.getCopernicusToken();

    const bbox = this.calculateBoundingBox(aoi.geometry);
    
    // Calculate approximate width and height for a 20m grid
    const R = 6371000; // Earth radius in meters
    const dLat = (bbox.maxLat - bbox.minLat) * Math.PI / 180;
    const heightMeters = dLat * R;
    const height = Math.max(1, Math.ceil(heightMeters / 20));

    const meanLat = (bbox.minLat + bbox.maxLat) / 2;
    const dLon = (bbox.maxLng - bbox.minLng) * Math.PI / 180;
    const widthMeters = dLon * R * Math.cos(meanLat * Math.PI / 180);
    const width = Math.max(1, Math.ceil(widthMeters / 20));

    if (process.env.NODE_ENV === 'development') {
      console.log(`[SENTINEL2] Downloading scene: ${scene.id}`);
      console.log(`[SENTINEL2] Calculated Dimensions: ${width}x${height} for 20m resolution`);
      console.log(`[SENTINEL2] Process API Request:`, {
        endpoint: 'https://sh.dataspace.copernicus.eu/process/v1',
        sceneId: scene.id,
        collection: 'sentinel-2-l2a',
        width, height,
        geometryType: aoi.geometry.type,
      });
    }

    // Exact requested band order for the model
    const evalscript = `//VERSION=3
function setup() {
  return {
    input: ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "SCL", "B11", "B12"],
    output: { 
      bands: 13, 
      sampleType: "FLOAT32" 
    }
  };
}
function evaluatePixel(sample) {
  return [
    sample.B01, 
    sample.B02, 
    sample.B03, 
    sample.B04, 
    sample.B05, 
    sample.B06, 
    sample.B07, 
    sample.B08, 
    sample.B8A, 
    sample.B09, 
    sample.SCL, 
    sample.B11, 
    sample.B12
  ];
}`;

    // Use the exact date of the scene for filtering
    // Note: STAC datetime might be full ISO string, we extract the date part
    const sceneDate = scene.date.split('T')[0];

    const payload = {
      input: {
        bounds: {
          geometry: aoi.geometry,
          properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" }
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: {
              timeRange: {
                from: `${sceneDate}T00:00:00Z`,
                to: `${sceneDate}T23:59:59Z`
              }
            }
          }
        ]
      },
      output: {
        width,
        height,
        responses: [
          {
            identifier: "default",
            format: { type: "image/tiff" }
          }
        ]
      },
      evalscript
    };

    const processUrl = 'https://sh.dataspace.copernicus.eu/process/v1';
    const res = await fetch(processUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[SENTINEL2] Process API Error:', res.status, errText);
      console.error('[SENTINEL2] Payload sent:', JSON.stringify(payload, null, 2));
      
      let safeError = errText;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error && parsed.error.message) {
          safeError = parsed.error.message;
        }
      } catch (e) {}

      throw new Error(`Copernicus Process API rejected the request: ${safeError}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      buffer,
      metadata: {
        width,
        height,
        resolution: "20m",
        bands: 13,
        bandNames: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B8A", "B9", "SCL", "B11", "B12"],
        fileSize: buffer.length
      }
    };
  }
}
