import { exec } from 'child_process';
import path from 'path';
import util from 'util';
import fs from 'fs/promises';

const execAsync = util.promisify(exec);

export class LulcPreprocessingService {
  /**
   * Validates and cleans a 13-band Sentinel-2 GeoTIFF for U-Net input.
   * (The live model server calculates NDVI/NDBI/NDWI internally).
   * @param inputFilePath Absolute path to the 13-band GeoTIFF
   * @returns Metadata about the validated 13-band GeoTIFF
   */
  static async preprocessTiff(inputFilePath: string) {
    try {
      // Validate input file exists
      await fs.access(inputFilePath);
      
      const tempDir = path.join(process.cwd(), 'tmp');
      const outputFileName = `unet_input_${path.basename(inputFilePath)}`;
      const outputFilePath = path.join(tempDir, outputFileName);
      
      const pythonScriptPath = path.join(process.cwd(), 'app', 'api', 'services', 'preprocess.py');
      
      // Execute the python script
      // Note: Assumes 'python' is available in the environment and has rasterio/numpy installed
      const command = `python "${pythonScriptPath}" "${inputFilePath}" "${outputFilePath}"`;
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && stderr.trim().length > 0 && !stdout.trim().startsWith('{')) {
        console.warn('[PREPROCESS] Python stderr:', stderr);
      }
      
      let result;
      try {
        result = JSON.parse(stdout.trim());
      } catch (parseErr) {
        throw new Error(`Failed to parse Python script output: ${stdout}`);
      }
      
      if (!result.success) {
        throw new Error(`Preprocessing failed: ${result.error}`);
      }
      
      // Append the output file path to the result
      result.outputFile = outputFilePath;
      
      // Note on normalization: 
      // Based on inspection of typical LULC pipelines, Sentinel-2 L2A BOA reflectance 
      // natively ranges from 0-1 or 0-10000. For our local model testing, it expects Float32.
      // We do not apply any hardcoded min-max scaling here to avoid distorting physical values.
      // The U-Net's internal batch normalization or input layer is expected to handle scaling 
      // if it was trained on raw reflectance/indices.
      result.normalization = "None (Preserved native FLOAT32 reflectance and index scales)";
      
      return result;
      
    } catch (error: any) {
      console.error('[PREPROCESS SERVICE] Error:', error.message);
      throw error;
    }
  }
}
