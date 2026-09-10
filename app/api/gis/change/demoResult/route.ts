import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    validation: {
      success: true,
      width: 10980,
      height: 10980,
      crs: "EPSG:32643",
      message: "Images validated and co-registered successfully (Demo Mode)."
    },
    detection: {
      success: true,
      validPixels: 115200420,
      maskedPixels: 5360180,
      minChange: -0.852,
      meanChange: -0.014,
      maxChange: 0.912,
      outputPath: "/mock-data/change_detection.png"
    }
  });
}
