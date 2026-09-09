import sys
import os
import io
import json
import base64
import numpy as np
import rasterio
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import matplotlib.patches as mpatches

CLASS_NAMES = ['Barren_Land', 'Built-up_Area', 'Crop', 'Forest', 'Water', 'Unclassified']
MPL_COLORS = ['#f4a460', '#dc143c', '#ffff00', '#008000', '#0000ff', '#888888']

def fig_to_b64(fig, dpi=120):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', pad_inches=0.05, dpi=dpi)
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return b64

def stretch_rgb(band):
    mask = (band > 0) & np.isfinite(band)
    if not np.any(mask):
        return np.zeros_like(band, dtype=np.float32)
    p2, p98 = np.percentile(band[mask], 2), np.percentile(band[mask], 98)
    stretched = np.clip((band - p2) / (p98 - p2 + 1e-8), 0, 1)
    stretched[~mask] = 0.0
    return stretched

def run_classification(tif_path):
    with rasterio.open(tif_path) as src:
        B2  = src.read(2).astype(np.float32)  # Blue
        B3  = src.read(3).astype(np.float32)  # Green
        B4  = src.read(4).astype(np.float32)  # Red
        B8  = src.read(8).astype(np.float32)  # NIR
        SCL = src.read(11).astype(np.float32) # Scene Classification Layer
        B11 = src.read(12).astype(np.float32) # SWIR1

    # Multi-spectral Sentinel-2 indices
    NDVI = (B8 - B4) / (B8 + B4 + 1e-8)
    NDBI = (B11 - B8) / (B11 + B8 + 1e-8)
    NDWI = (B3 - B11) / (B3 + B11 + 1e-8)

    H, W = B4.shape
    total_px = H * W
    mask = np.full((H, W), 5, dtype=np.int32) # Default 5 = Unclassified

    valid_bg = (B2 > 0) | (B3 > 0) | (B4 > 0) | (B8 > 0)

    # 1. Water: NDWI > 0.0 or SCL == 6
    water_mask = valid_bg & ((NDWI > 0.0) | (SCL == 6))
    mask[water_mask] = 4

    # 2. Forest: Dense canopy (NDVI > 0.52 and B8 > 0.25)
    forest_mask = valid_bg & (~water_mask) & (NDVI > 0.52) & (B8 > 0.25)
    mask[forest_mask] = 3

    # 3. Crop: Cultivated vegetation (NDVI > 0.35 and NDBI < -0.02)
    crop_mask = valid_bg & (~water_mask) & (~forest_mask) & (NDVI > 0.35) & (NDBI < -0.02)
    mask[crop_mask] = 2

    # 4. Built-up Area: Urban/residential peak (NDBI >= -0.02 and NDVI < 0.40 and B11 > 0.10)
    built_mask = valid_bg & (~water_mask) & (~forest_mask) & (~crop_mask) & (NDBI >= -0.02) & (NDVI < 0.40) & (B11 > 0.10)
    mask[built_mask] = 1

    # 5. Barren Land: Exposed soil (SCL == 5 or low vegetation)
    barren_mask = valid_bg & (~water_mask) & (~forest_mask) & (~crop_mask) & (~built_mask)
    mask[barren_mask] = 0

    # Unclassified for true zero margin pixels
    mask[~valid_bg] = 5

    # Compute class statistics
    class_stats = {}
    for i, name in enumerate(CLASS_NAMES):
        cnt = np.sum(mask == i)
        class_stats[name] = round(float(cnt) / total_px * 100, 2)

    # Generate RGB Composite
    rgb = np.dstack([stretch_rgb(B4), stretch_rgb(B3), stretch_rgb(B2)])

    # Generate Plot 1: Segmentation Mask
    cmap = mcolors.ListedColormap(MPL_COLORS)
    bounds_arr = np.arange(len(CLASS_NAMES) + 1) - 0.5
    norm = mcolors.BoundaryNorm(bounds_arr, cmap.N)

    fig1, ax1 = plt.subplots(figsize=(6, 6))
    ax1.imshow(mask, cmap=cmap, norm=norm)
    ax1.axis('off')
    ax1.set_title('Sentinel-2 Multi-Spectral Segmentation Mask', fontsize=12, pad=8)
    patches = [mpatches.Patch(color=MPL_COLORS[i], label=CLASS_NAMES[i].replace('_', ' ')) for i in range(len(CLASS_NAMES))]
    ax1.legend(handles=patches, loc='upper right', title='Classes', fontsize=8, title_fontsize=9)
    seg_b64 = fig_to_b64(fig1)

    # Generate Plot 2: Classified Overlay
    overlay_colors = np.array([[244, 164, 96], [220, 20, 60], [255, 255, 0], [0, 128, 0], [0, 0, 255], [136, 136, 136]], dtype=np.float32) / 255.0
    classified_rgb = overlay_colors[mask]
    blend = 0.45 * rgb + 0.55 * classified_rgb

    fig2, axs2 = plt.subplots(1, 2, figsize=(12, 6))
    axs2[0].imshow(rgb); axs2[0].set_title('Sentinel-2 RGB Imagery', fontsize=12); axs2[0].axis('off')
    axs2[1].imshow(blend); axs2[1].set_title('Multi-Spectral Classified Overlay', fontsize=12); axs2[1].axis('off')
    axs2[1].legend(handles=patches, loc='upper right', title='Classes', fontsize=8, title_fontsize=9)
    plt.tight_layout()
    overlay_b64 = fig_to_b64(fig2)

    # Generate Plot 3: Annotated Types
    fig3, ax3 = plt.subplots(figsize=(6, 6))
    ax3.imshow(rgb)
    ax3.set_title('Annotated Land Cover Types', fontsize=12)
    ax3.axis('off')
    annotated_b64 = fig_to_b64(fig3)

    return {
        'class_stats': class_stats,
        'segmentation_mask': seg_b64,
        'overlay': overlay_b64,
        'annotated': annotated_b64
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input TIFF file path provided.'}))
        sys.exit(1)
    
    input_tif = sys.argv[1]
    try:
        res = run_classification(input_tif)
        print(json.dumps(res))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
