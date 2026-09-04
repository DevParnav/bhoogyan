export type PredictionScenario = {
  id: string;
  region: string;
  crop: string;
  year: number;
  projectedYield: number; // tons per hectare
  confidence: number; // percentage
  description: string;
};

export const predictionScenarios: PredictionScenario[] = [
  {
    id: 'pred-1',
    region: 'Maharashtra - Pune District',
    crop: 'Soybean',
    year: 2025,
    projectedYield: 2.8,
    confidence: 92,
    description: 'Based on recent precipitation trends and soil moisture, soybean yield is expected to be higher than average.'
  },
  {
    id: 'pred-2',
    region: 'Karnataka - Bengaluru Rural',
    crop: 'Millet',
    year: 2025,
    projectedYield: 1.9,
    confidence: 88,
    description: 'Drought‑resilient millet shows stable yields despite lower rainfall.'
  },
  {
    id: 'pred-3',
    region: 'Tamil Nadu - Coimbatore',
    crop: 'Sugarcane',
    year: 2024,
    projectedYield: 75,
    confidence: 94,
    description: 'Favorable temperature and irrigation availability boost sugarcane productivity.'
  },
  {
    id: 'pred-4',
    region: 'Gujarat - Kutch',
    crop: 'Barley',
    year: 2025,
    projectedYield: 2.2,
    confidence: 85,
    description: 'Barley adapts well to saline soils of Kutch, maintaining decent yields.'
  },
  {
    id: 'pred-5',
    region: 'Punjab - Amritsar',
    crop: 'Wheat',
    year: 2024,
    projectedYield: 4.5,
    confidence: 96,
    description: 'High‑quality seed and adequate irrigation project a bumper wheat harvest.'
  },
  {
    id: 'pred-6',
    region: 'Madhya Pradesh - Bhopal',
    crop: 'Rice',
    year: 2025,
    projectedYield: 3.8,
    confidence: 90,
    description: 'Monsoon forecasts indicate sufficient rainfall for double‑crop rice.'
  },
  {
    id: 'pred-7',
    region: 'Kerala - Wayanad',
    crop: 'Coffee',
    year: 2024,
    projectedYield: 1.3,
    confidence: 91,
    description: 'Stable climate supports consistent coffee bean yields.'
  },
  {
    id: 'pred-8',
    region: 'Uttar Pradesh - Lucknow',
    crop: 'Maize',
    year: 2025,
    projectedYield: 3.1,
    confidence: 87,
    description: 'Improved seed varieties and moderate rainfall improve maize prospects.'
  },
  {
    id: 'pred-9',
    region: 'Rajasthan - Jaisalmer',
    crop: 'Camelina',
    year: 2025,
    projectedYield: 1.0,
    confidence: 80,
    description: 'Camelina thrives in arid conditions, offering a niche oilseed opportunity.'
  },
  {
    id: 'pred-10',
    region: 'West Bengal - Darjeeling',
    crop: 'Tea',
    year: 2024,
    projectedYield: 2.5,
    confidence: 93,
    description: 'Elevated hill temperatures boost tea leaf quality and yield.'
  }
];
