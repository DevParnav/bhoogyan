export interface BhuvanLulcResponse {
  status: string;
  source: string;
  raw_response: any;
}

export class BhuvanLulcAoiWiseService {
  /**
   * Proxies a GeoJSON AOI to the Bhuvan LULC AOI Wise API.
   * Returns real LULC statistics for the requested area.
   * 
   * @param geoJson The AOI drawn by the user
   */
  public static async analyzeAoi(geoJson: any): Promise<BhuvanLulcResponse> {
    const token = process.env.BHUVAN_ACCESS_TOKEN;
    // Fallback to the official thematic statistics API if not explicitly overridden
    const endpoint = process.env.BHUVAN_API_ENDPOINT || 'https://bhuvan-app1.nrsc.gov.in/api/lulc50k/aoi';

    if (!token) {
      throw new Error("Bhuvan API is not configured. Missing access token.");
    }

    try {
      // In a production environment with the real Bhuvan API,
      // the payload format (e.g., WKT vs GeoJSON) depends on their exact schema.
      // We send the GeoJSON geometry.
      const payload = {
        geometry: geoJson
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Bhuvan API is not configured."); // Token expired or invalid
        }
        throw new Error("Bhuvan LULC analysis could not be completed.");
      }

      const data = await response.json();

      return {
        status: "success",
        source: "Bhuvan",
        raw_response: data
      };
    } catch (error: any) {
      if (error.message === "Bhuvan API is not configured.") {
        throw error;
      }
      console.error("Bhuvan API Request Failed:", error);
      throw new Error("Bhuvan LULC analysis could not be completed.");
    }
  }
}
