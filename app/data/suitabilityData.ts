export type SuitabilityScenario = {
  id: string;
  region: string;
  crop: string;
  suitabilityScore: number; // 0-100
  limitingFactors: string[];
  description: string;
};

export const suitabilityScenarios: SuitabilityScenario[] = [
  {
    id: 'suit-1',
    region: 'Maharashtra - Ahmednagar',
    crop: 'Soybean',
    suitabilityScore: 85,
    limitingFactors: ['Soil pH moderate'],
    description: 'High suitability for soybean due to well‑drained loam soils and adequate rainfall.'
  },
  {
    id: 'suit-2',
    region: 'Karnataka - Mysore',
    crop: 'Millet',
    suitabilityScore: 78,
    limitingFactors: ['Low fertility'],
    description: 'Millet thrives in semi‑arid conditions despite lower soil nutrients.'
  },
  {
    id: 'suit-3',
    region: 'Tamil Nadu - Erode',
    crop: 'Cotton',
    suitabilityScore: 82,
    limitingFactors: ['Water availability'],
    description: 'Cotton yields are good with supplemental irrigation during dry spells.'
  },
  {
    id: 'suit-4',
    region: 'Gujarat - Anand',
    crop: 'Sugarcane',
    suitabilityScore: 90,
    limitingFactors: [],
    description: 'Ideal climate and irrigation infrastructure make this region prime for sugarcane.'
  },
  {
    id: 'suit-5',
    region: 'Punjab - Patiala',
    crop: 'Wheat',
    suitabilityScore: 88,
    limitingFactors: ['Winter cold spikes'],
    description: 'Excellent wheat suitability with a short risk of frost.'
  },
  {
    id: 'suit-6',
    region: 'Madhya Pradesh - Indore',
    crop: 'Rice',
    suitabilityScore: 80,
    limitingFactors: ['Monsoon variability'],
    description: 'Rice performs well with proper water management during monsoon.'
  },
  {
    id: 'suit-7',
    region: 'Kerala - Idukki',
    crop: 'Coffee',
    suitabilityScore: 92,
    limitingFactors: [],
    description: 'High altitude and steady rainfall provide optimal coffee growing conditions.'
  },
  {
    id: 'suit-8',
    region: 'Uttar Pradesh - Kanpur',
    crop: 'Maize',
    suitabilityScore: 75,
    limitingFactors: ['Soil salinity'],
    description: 'Maize is viable but soil salinity limits maximum yields.'
  },
  {
    id: 'suit-9',
    region: 'Rajasthan - Jodhpur',
    crop: 'Barley',
    suitabilityScore: 70,
    limitingFactors: ['Water scarcity'],
    description: 'Barley tolerates arid conditions but yields are modest.'
  },
  {
    id: 'suit-10',
    region: 'West Bengal - Malda',
    crop: 'Tea',
    suitabilityScore: 89,
    limitingFactors: ['Pest pressure'],
    description: 'Favourable hilly terrain and climate, though pest management required.'
  }
];
