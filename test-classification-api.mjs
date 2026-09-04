import fs from 'fs';
import path from 'path';

async function runTest() {
  const tiffPath = String.raw`C:\Users\Parnav\Downloads\S2C_MSIL2A_20260821T052641_N0512_R105_T43RGM_20260821T102216.SAFE\S2C_MSIL2A_20260821T052641_N0512_R105_T43RGM_20260821T102216.SAFE\sentinel2_test_512.tif`;
  
  if (!fs.existsSync(tiffPath)) {
    console.error("Test TIFF not found at:", tiffPath);
    return;
  }

  console.log("Reading file:", tiffPath);
  const fileBuffer = fs.readFileSync(tiffPath);
  const fileBlob = new Blob([fileBuffer], { type: 'image/tiff' });

  const formData = new FormData();
  // Provide the filename explicitly so it behaves like a standard File upload in the browser
  formData.append('file', fileBlob, 'sentinel2_test_512.tif');

  console.log("Sending POST request to http://localhost:3000/api/gis/classification...");

  try {
    const response = await fetch('http://localhost:3000/api/gis/classification', {
      method: 'POST',
      body: formData,
    });

    console.log(`\nHTTP Status: ${response.status} ${response.statusText}`);

    const data = await response.json();

    if (data.class_stats) {
      console.log("\nClass Statistics:");
      console.log(JSON.stringify(data.class_stats, null, 2));
    } else if (data.error) {
      console.log("\nAPI Error Response:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log("\nResponse Body (truncated):");
      console.log(JSON.stringify(data, null, 2).substring(0, 1000) + '...');
    }

    const saveBase64Image = (base64Str, filename) => {
      if (!base64Str) return;
      // Strip potential data URI prefix if present
      const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(filename, base64Data, 'base64');
      console.log(`Saved image to: ${filename}`);
    };

    if (data.segmentation_mask) saveBase64Image(data.segmentation_mask, 'classification_segmentation_mask.png');
    if (data.overlay) saveBase64Image(data.overlay, 'classification_overlay.png');
    if (data.annotated) saveBase64Image(data.annotated, 'classification_annotated.png');

    console.log("\nTest script finished.");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTest();
