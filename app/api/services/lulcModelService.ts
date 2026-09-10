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

    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        console.log(`[CLASSIFICATION] lulcModelService: sending POST to ${modelUrl}/predict (Attempt ${attempt + 1}/${maxRetries})`);
        
        // Add AbortController to handle timeouts (e.g., 60 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        const response = await fetch(`${modelUrl}/predict`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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
          
          if (response.status >= 500 && attempt < maxRetries - 1) {
             console.warn(`[CLASSIFICATION] Server error: ${errorMsg}. Retrying...`);
             throw new Error("Retryable error");
          }
          
          throw new Error(`Model Classification Failed: ${errorMsg}`);
        }

        return await response.json();
      } catch (error: any) {
        attempt++;
        const isTimeout = error.name === 'AbortError' || error.message.includes('fetch failed');
        
        if (attempt >= maxRetries || (!isTimeout && error.message !== "Retryable error")) {
          console.error("LULC Model Service Error after max retries:", error);
          throw error;
        }
        
        const delay = Math.pow(2, attempt) * 2000; // 4s, 8s
        console.log(`[CLASSIFICATION] Request failed or timed out. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
