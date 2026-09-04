import sys
import json
import traceback
import rasterio
import numpy as np

def calculate_ndvi_change(before_path, after_path, output_path):
    try:
        with rasterio.open(before_path) as src_before, rasterio.open(after_path) as src_after:
            # 13 bands expected. B4 is index 3 (1-based index 4), B8 is index 7, SCL is index 10
            
            # Read bands (1-based indexing in rasterio)
            b4_before = src_before.read(4).astype('float32')
            b8_before = src_before.read(8).astype('float32')
            scl_before = src_before.read(11)

            b4_after = src_after.read(4).astype('float32')
            b8_after = src_after.read(8).astype('float32')
            scl_after = src_after.read(11)

            # Validity Masking
            # Valid classes: 4 (Vegetation), 5 (Non-vegetated), 6 (Water), 7 (Unclassified)
            valid_classes = [4, 5, 6, 7]
            
            mask_before = np.isin(scl_before, valid_classes)
            mask_after = np.isin(scl_after, valid_classes)
            
            # Pixel is valid only if valid in BOTH scenes
            valid_mask = mask_before & mask_after

            # Calculate NDVI
            # NDVI = (B8 - B4) / (B8 + B4 + 1e-8)
            ndvi_before = (b8_before - b4_before) / (b8_before + b4_before + 1e-8)
            ndvi_after = (b8_after - b4_after) / (b8_after + b4_after + 1e-8)

            # Calculate Change
            ndvi_change = ndvi_after - ndvi_before

            # Apply Validity Mask (set invalid pixels to NaN)
            ndvi_change[~valid_mask] = np.nan

            # Statistics
            valid_pixels = np.sum(valid_mask)
            masked_pixels = np.sum(~valid_mask)
            
            min_val = float(np.nanmin(ndvi_change)) if valid_pixels > 0 else 0.0
            max_val = float(np.nanmax(ndvi_change)) if valid_pixels > 0 else 0.0
            mean_val = float(np.nanmean(ndvi_change)) if valid_pixels > 0 else 0.0

            # Write Output Raster
            meta = src_before.meta.copy()
            meta.update({
                'count': 1,
                'dtype': 'float32',
                'nodata': np.nan
            })

            with rasterio.open(output_path, 'w', **meta) as dst:
                dst.write(ndvi_change, 1)
                dst.set_band_description(1, 'NDVI_Change')

            # Return stats as JSON via stdout
            result = {
                "success": True,
                "width": src_before.width,
                "height": src_before.height,
                "crs": str(src_before.crs),
                "transform": [float(x) for x in src_before.transform],
                "validPixels": int(valid_pixels),
                "maskedPixels": int(masked_pixels),
                "minChange": min_val,
                "maxChange": max_val,
                "meanChange": mean_val,
                "outputPath": output_path
            }
            print(json.dumps(result))

    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print(json.dumps({"success": False, "error": "Usage: changeDetection.py <before_tiff> <after_tiff> <output_tiff>"}))
        sys.exit(1)
        
    calculate_ndvi_change(sys.argv[1], sys.argv[2], sys.argv[3])
