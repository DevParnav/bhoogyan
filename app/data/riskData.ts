export type RiskScenario = {
  id: string;
  region: string;
  hazard: 'Flood' | 'Drought' | 'Landslide' | 'Heatwave' | 'PestOutbreak';
  severity: number; // 1-10 scale
  probability: number; // percentage
  description: string;
};

export const riskScenarios: RiskScenario[] = [
  {
    id: 'risk-1',
    region: 'Ganga Basin - Uttar Pradesh',
    hazard: 'Flood',
    severity: 8,
    probability: 70,
    description: 'Monsoon-driven river overflow expected due to above‑average rainfall.'
  },
  {
    id: 'risk-2',
    region: 'Thar Desert - Rajasthan',
    hazard: 'Drought',
    severity: 7,
    probability: 65,
    description: 'Extended dry spell and high temperatures increase drought risk.'
  },
  {
    id: 'risk-3',
    region: 'Western Ghats - Maharashtra',
    hazard: 'Landslide',
    severity: 6,
    probability: 55,
    description: 'Heavy rains on steep slopes raise landslide susceptibility.'
  },
  {
    id: 'risk-4',
    region: 'Deccan Plateau - Karnataka',
    hazard: 'Heatwave',
    severity: 5,
    probability: 60,
    description: 'Projected temperature spikes above normal during summer months.'
  },
  {
    id: 'risk-5',
    region: 'Punjab - Ludhiana',
    hazard: 'PestOutbreak',
    severity: 6,
    probability: 50,
    description: 'Widespread aphid infestation threatening wheat crops.'
  },
  {
    id: 'risk-6',
    region: 'Kerala - Alappuzha',
    hazard: 'Flood',
    severity: 7,
    probability: 68,
    description: 'Backwater levels rising due to combined river and sea surge.'
  },
  {
    id: 'risk-7',
    region: 'Madhya Pradesh - Satpura',
    hazard: 'Landslide',
    severity: 5,
    probability: 45,
    description: 'Deforestation on hillsides increases slide risk during rains.'
  },
  {
    id: 'risk-8',
    region: 'Gujarat - Saurashtra',
    hazard: 'Heatwave',
    severity: 8,
    probability: 72,
    description: 'Extreme heat indexes expected, affecting labor productivity.'
  },
  {
    id: 'risk-9',
    region: 'Tamil Nadu - Kaveri Delta',
    hazard: 'Drought',
    severity: 6,
    probability: 58,
    description: 'Reduced upstream flow leads to water stress for agriculture.'
  },
  {
    id: 'risk-10',
    region: 'Assam - Brahmaputra Valley',
    hazard: 'Flood',
    severity: 9,
    probability: 80,
    description: 'Riverbank erosion and high discharge pose severe flood danger.'
  }
];
