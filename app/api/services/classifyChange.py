import sys
import json
import traceback
import rasterio
import numpy as np
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap

# Classes:
# 0 = NO_SIGNIFICANT_CHANGE
# 1 = VEGETATION_INCREASE
# 2 = VEGETATION_DECREASE
# 3 = MASKED

def calculate_pixel_area_m2(src):
    """
    Estimates the pixel area in square meters.
    If projected (meters), it's exact from the transform.
    If geographic (degrees), approximates based on center latitude.
    """
    if src.crs and src.crs.is_projected:
        return abs(src.transform[0] * src.transform[4])
    else:
        # Approximate for EPSG:4326
        # 1 degree of latitude is ~111,320 meters
        # 1 degree of longitude is ~111,320 * cos(latitude) meters
        bounds = src.bounds
        center_lat = (bounds.bottom + bounds.top) / 2
        lat_rad = np.radians(center_lat)
        
        deg_lat_m = 111320.0
        deg_lon_m = 111320.0 * np.cos(lat_rad)
        
        pixel_width_deg = abs(src.transform[0])
        pixel_height_deg = abs(src.transform[4])
        
        pixel_width_m = pixel_width_deg * deg_lon_m
        pixel_height_m = pixel_height_deg * deg_lat_m
        
        return pixel_width_m * pixel_height_m

def classify_change(ndvi_change_path, threshold, output_path):
    try:
        threshold = float(threshold)
        
        with rasterio.open(ndvi_change_path) as src:
            ndvi_change = src.read(1)
            
            # Create classification array
            # default to 0 (No Significant Change)
            classified = np.zeros_like(ndvi_change, dtype=np.uint8)
            
            # Masked (NaN values from STEP 6B)
            masked_mask = np.isnan(ndvi_change)
            classified[masked_mask] = 3
            
            # Increase
            increase_mask = (ndvi_change >= threshold) & ~masked_mask
            classified[increase_mask] = 1
            
            # Decrease
            decrease_mask = (ndvi_change <= -threshold) & ~masked_mask
            classified[decrease_mask] = 2
            
            # Counts
            total_pixels = ndvi_change.size
            masked_pixels = int(np.sum(masked_mask))
            increase_pixels = int(np.sum(increase_mask))
            decrease_pixels = int(np.sum(decrease_mask))
            
            valid_pixels = total_pixels - masked_pixels
            unchanged_pixels = valid_pixels - (increase_pixels + decrease_pixels)
            
            # Area Calculation
            pixel_area_m2 = calculate_pixel_area_m2(src)
            
            total_valid_area_m2 = valid_pixels * pixel_area_m2
            increase_area_m2 = increase_pixels * pixel_area_m2
            decrease_area_m2 = decrease_pixels * pixel_area_m2
            unchanged_area_m2 = unchanged_pixels * pixel_area_m2
            changed_area_m2 = increase_area_m2 + decrease_area_m2
            
            changed_area_percent = (changed_area_m2 / total_valid_area_m2 * 100) if total_valid_area_m2 > 0 else 0.0

            # Write Output Raster
            meta = src.meta.copy()
            meta.update({
                'dtype': 'uint8',
                'nodata': 3
            })

            with rasterio.open(output_path, 'w', **meta) as dst:
                dst.write(classified, 1)
                dst.set_band_description(1, 'Categorical_Change')

            # Visualization (Base64 PNG)
            # 0: No Change (Transparent/White), 1: Increase (Green), 2: Decrease (Orange/Red), 3: Masked (Gray)
            colors = [
                (1.0, 1.0, 1.0, 0.0),      # 0 = Transparent
                (0.133, 0.545, 0.133, 1.0), # 1 = ForestGreen
                (0.863, 0.078, 0.235, 1.0), # 2 = Crimson
                (0.5, 0.5, 0.5, 0.5)        # 3 = Gray (Semi-transparent)
            ]
            cmap = ListedColormap(colors)
            
            plt.figure(figsize=(6, 6), dpi=100)
            plt.axis('off')
            
            # Ensure the color map binds exactly to 0, 1, 2, 3
            plt.imshow(classified, cmap=cmap, vmin=0, vmax=3, interpolation='nearest')
            
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0, transparent=True)
            plt.close()
            buf.seek(0)
            base64_png = base64.b64encode(buf.read()).decode('utf-8')

            # Return stats as JSON via stdout
            result = {
                "success": True,
                "width": src.width,
                "height": src.height,
                "crs": str(src.crs),
                "threshold": threshold,
                "validPixels": valid_pixels,
                "maskedPixels": masked_pixels,
                "increasePixels": increase_pixels,
                "decreasePixels": decrease_pixels,
                "unchangedPixels": unchanged_pixels,
                "totalValidAreaM2": total_valid_area_m2,
                "increaseAreaM2": increase_area_m2,
                "decreaseAreaM2": decrease_area_m2,
                "changedAreaM2": changed_area_m2,
                "unchangedAreaM2": unchanged_area_m2,
                "changedAreaPercent": changed_area_percent,
                "outputRasterPath": output_path,
                "previewBase64": base64_png
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
        print(json.dumps({"success": False, "error": "Usage: classifyChange.py <ndvi_change_path> <threshold> <output_path>"}))
        sys.exit(1)
        
    classify_change(sys.argv[1], sys.argv[2], sys.argv[3])
