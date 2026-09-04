export class LulcModelService {
  /**
   * Sends a Sentinel-2 TIFF file to the pretrained LULC model for classification.
   * 
   * @param file The TIFF file as a Blob or File object
   * @returns The JSON response containing segmentation masks and class stats
   */
  public static async classifyLandCover(file: File | Blob): Promise<any> {
    const modelUrl = process.env.LULC_MODEL_URL || 'https://bhargav37-landcover-model-server.hf.space';

    const formData = new FormData();
    // FIX: Convert the Next.js File stream to a native Blob/Buffer first.
    // Passing Next.js File streams directly into a new Node native fetch FormData 
    // causes undici to hang the connection open while reading the response body.
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type || 'image/tiff' });
    formData.append('file', blob, (file as any).name || 'image.tif');

    try {
      console.log('[CLASSIFICATION] lulcModelService: sending POST to', `${modelUrl}/predict`);
      const response = await fetch(`${modelUrl}/predict`, {
        method: 'POST',
        // Note: fetch will automatically set the Content-Type to multipart/form-data
        // and append the correct boundary when passing a FormData object.
        body: formData,
      });
      console.log(`[CLASSIFICATION] lulcModelService: received status ${response.status}`);

      if (!response.ok) {
        // Attempt to parse any error message returned by the server
        let errorMsg = `HTTP Error ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMsg += ` - ${errorData.error}`;
          } else {
            errorMsg += ` - ${JSON.stringify(errorData)}`;
          }
        } catch (e) {
          // If response is not JSON, try text
          try {
            const textData = await response.text();
            if (textData) {
              errorMsg += ` - ${textData}`;
            }
          } catch (e2) {
            // ignore
          }
        }
        
        throw new Error(`Model Classification Failed: ${errorMsg}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("LULC Model Service Error:", error);
      throw error;
    }
  }
}
