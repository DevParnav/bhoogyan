import sys
import json
import traceback
import rasterio
import numpy as np

def process_tiff(input_path, output_path):
    try:
        with rasterio.open(input_path) as src:
            if src.count != 13:
                raise ValueError(f"Expected 13 bands, but got {src.count}")
            
            # Read all 13 bands
            data = src.read()
            
            # Validate width, height, crs, transform
            if src.width <= 0 or src.height <= 0:
                raise ValueError("Invalid dimensions")
            if not src.crs:
                raise ValueError("Missing CRS")
            if not src.transform:
                raise ValueError("Missing GeoTransform")
                
            # Ensure Float32 data type to match model expectations
            out_data = data.astype('float32')
            
            # Metadata for the validated 13-band output
            meta = src.meta.copy()
            meta.update({
                'count': 13,
                'dtype': 'float32'
            })
            
            band_descriptions = [
                "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B8A", "B9", "SCL", "B11", "B12"
            ]
            
            # Write a clean, validated 13-band TIFF (model server computes indices internally)
            with rasterio.open(output_path, 'w', **meta) as dst:
                dst.write(out_data)
                for i, desc in enumerate(band_descriptions, 1):
                    dst.set_band_description(i, desc)
                    
            # Return JSON metadata via stdout
            result = {
                "success": True,
                "inputBands": 13,
                "outputChannels": 13,
                "width": src.width,
                "height": src.height,
                "resolution": 20,
                "channels": band_descriptions,
                "normalization": "None (Preserved raw reflectance)",
                "indicesComputed": "None (Model server computes internally)"
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
    if len(sys.argv) != 3:
        print(json.dumps({"success": False, "error": "Usage: preprocess.py <input_tiff> <output_tiff>"}))
        sys.exit(1)
        
    process_tiff(sys.argv[1], sys.argv[2])
