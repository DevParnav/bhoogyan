import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export class LulcModelService {
  /**
   * Performs multi-spectral Sentinel-2 satellite land cover classification.
   * 
   * @param file The TIFF file as a Blob or File object
   * @returns The JSON response containing segmentation masks and class stats
   */
  public static async classifyLandCover(file: File | Blob): Promise<any> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save buffer to temporary file for Python multi-spectral classifier script
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `s2_${Date.now()}_${Math.random().toString(36).substring(7)}.tif`);

    try {
      fs.writeFileSync(tempFilePath, buffer);
      console.log(`[CLASSIFICATION] Wrote Sentinel-2 TIFF buffer to temporary file: ${tempFilePath}`);

      const scriptPath = path.join(process.cwd(), 'app', 'api', 'services', 'classify_sentinel2.py');

      console.log(`[CLASSIFICATION] Running Sentinel-2 Multi-Spectral Classifier script...`);
      const { stdout, stderr } = await execFileAsync('python', [scriptPath, tempFilePath], {
        maxBuffer: 10 * 1024 * 1024
      });

      if (stderr && stderr.trim().length > 0) {
        console.warn(`[CLASSIFICATION] Python stderr:`, stderr.trim());
      }

      const result = JSON.parse(stdout.trim());
      if (result.error) {
        throw new Error(result.error);
      }

      console.log(`[CLASSIFICATION] Multi-Spectral Classification Completed Successfully:`, result.class_stats);
      return result;
    } catch (err: any) {
      console.warn(`[CLASSIFICATION] Local Multi-Spectral classifier error: ${err.message}. Falling back to remote endpoint...`);
      return this.classifyLandCoverRemote(file);
    } finally {
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {}
      }
    }
  }

  private static async classifyLandCoverRemote(file: File | Blob): Promise<any> {
    const modelUrl = process.env.LULC_MODEL_URL || 'https://bhargav37-landcover-model-server.hf.space';

    const formData = new FormData();
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type || 'image/tiff' });
    formData.append('file', blob, (file as any).name || 'image.tif');

    const response = await fetch(`${modelUrl}/predict`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Remote classification failed: HTTP ${response.status}`);
    }

    return await response.json();
  }
}

