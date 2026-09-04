import sys
import json
import traceback
import rasterio

def validate_pair(before_path, after_path):
    try:
        with rasterio.open(before_path) as src_a, rasterio.open(after_path) as src_b:
            # 1. Band Count
            if src_a.count != 13 or src_b.count != 13:
                raise ValueError(f"Both scenes must have 13 bands. Got {src_a.count} and {src_b.count}")
            
            # 2. CRS
            if src_a.crs != src_b.crs:
                raise ValueError(f"CRS mismatch: {src_a.crs} vs {src_b.crs}")
                
            # 3. Transform (Grid alignment)
            if src_a.transform != src_b.transform:
                raise ValueError(f"Spatial transform mismatch. Rasters are not aligned.\n{src_a.transform}\n{src_b.transform}")
                
            # 4. Dimensions
            if src_a.width != src_b.width or src_a.height != src_b.height:
                raise ValueError(f"Dimension mismatch: {src_a.width}x{src_a.height} vs {src_b.width}x{src_b.height}")
                
            # 5. Dtype (Just checking first band for both)
            dtype_a = src_a.dtypes[0]
            dtype_b = src_b.dtypes[0]
            if dtype_a != 'float32' or dtype_b != 'float32':
                raise ValueError(f"Dtype must be float32 for both scenes. Got {dtype_a} and {dtype_b}")

            result = {
                "success": True,
                "width": src_a.width,
                "height": src_a.height,
                "crs": str(src_a.crs),
                "transform": [float(x) for x in src_a.transform],
                "bands": 13,
                "message": "Both Sentinel-2 scenes are perfectly aligned and structurally identical."
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
        print(json.dumps({"success": False, "error": "Usage: validate_pair.py <before_tiff> <after_tiff>"}))
        sys.exit(1)
        
    validate_pair(sys.argv[1], sys.argv[2])
