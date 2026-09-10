// app/data/landIntelligenceDemoData.ts

export type PredictionDemoDataset = {
  id: string;
  title: string;
  predictedDistribution: {
    agriculture: number;
    builtUp: number;
    forest: number;
    water: number;
    bare: number;
  };
  predictedAreaChangeSqKm: number;
  growthPercentage: number;
  confidence: number;
  forecastPeriod: string;
  dominantClass: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  interpretation: string;
  chartData: { name: string; value: number; color: string }[];
};

export const predictionDemoDatasets: PredictionDemoDataset[] = [
  {
    id: "pred-1",
    title: "Strong Urban Expansion",
    predictedDistribution: { agriculture: 25.5, builtUp: 55.0, forest: 10.5, water: 5.0, bare: 4.0 },
    predictedAreaChangeSqKm: +14.2,
    growthPercentage: 35.5,
    confidence: 88,
    forecastPeriod: "5 Years (2031)",
    dominantClass: "Built-up Area",
    trend: 'increasing',
    interpretation: "Significant urban sprawl is projected due to nearby infrastructure projects, largely replacing agricultural land.",
    chartData: [
      { name: "Agriculture", value: 25.5, color: "#eab308" },
      { name: "Built-Up", value: 55.0, color: "#ef4444" },
      { name: "Forest", value: 10.5, color: "#22c55e" },
      { name: "Water", value: 5.0, color: "#3b82f6" },
      { name: "Bare", value: 4.0, color: "#9ca3af" },
    ]
  },
  {
    id: "pred-2",
    title: "Agricultural Intensification",
    predictedDistribution: { agriculture: 65.2, builtUp: 15.1, forest: 12.0, water: 6.5, bare: 1.2 },
    predictedAreaChangeSqKm: +8.5,
    growthPercentage: 15.0,
    confidence: 82,
    forecastPeriod: "5 Years (2031)",
    dominantClass: "Agriculture",
    trend: 'increasing',
    interpretation: "Farming activities are intensifying, utilizing formerly barren lands and encroaching slightly on peripheral vegetation.",
    chartData: [
      { name: "Agriculture", value: 65.2, color: "#eab308" },
      { name: "Built-Up", value: 15.1, color: "#ef4444" },
      { name: "Forest", value: 12.0, color: "#22c55e" },
      { name: "Water", value: 6.5, color: "#3b82f6" },
      { name: "Bare", value: 1.2, color: "#9ca3af" },
    ]
  },
  {
    id: "pred-3",
    title: "Deforestation & Bare Land Increase",
    predictedDistribution: { agriculture: 20.0, builtUp: 10.0, forest: 35.0, water: 5.0, bare: 30.0 },
    predictedAreaChangeSqKm: -12.4,
    growthPercentage: -22.5,
    confidence: 91,
    forecastPeriod: "10 Years (2036)",
    dominantClass: "Forest",
    trend: 'decreasing',
    interpretation: "Severe deforestation trends suggest significant loss of tree cover, resulting in exposed bare soil susceptible to erosion.",
    chartData: [
      { name: "Agriculture", value: 20.0, color: "#eab308" },
      { name: "Built-Up", value: 10.0, color: "#ef4444" },
      { name: "Forest", value: 35.0, color: "#22c55e" },
      { name: "Water", value: 5.0, color: "#3b82f6" },
      { name: "Bare", value: 30.0, color: "#9ca3af" },
    ]
  },
  {
    id: "pred-4",
    title: "Stable Conservation Zone",
    predictedDistribution: { agriculture: 5.0, builtUp: 2.0, forest: 85.0, water: 7.0, bare: 1.0 },
    predictedAreaChangeSqKm: +1.2,
    growthPercentage: 1.5,
    confidence: 95,
    forecastPeriod: "5 Years (2031)",
    dominantClass: "Forest",
    trend: 'stable',
    interpretation: "Protected status and geographical isolation are expected to maintain the current forest cover with minimal human disturbance.",
    chartData: [
      { name: "Agriculture", value: 5.0, color: "#eab308" },
      { name: "Built-Up", value: 2.0, color: "#ef4444" },
      { name: "Forest", value: 85.0, color: "#22c55e" },
      { name: "Water", value: 7.0, color: "#3b82f6" },
      { name: "Bare", value: 1.0, color: "#9ca3af" },
    ]
  },
  {
    id: "pred-5",
    title: "Water Body Shrinkage",
    predictedDistribution: { agriculture: 40.0, builtUp: 20.0, forest: 10.0, water: 8.0, bare: 22.0 },
    predictedAreaChangeSqKm: -6.5,
    growthPercentage: -45.0,
    confidence: 86,
    forecastPeriod: "3 Years (2029)",
    dominantClass: "Agriculture",
    trend: 'decreasing',
    interpretation: "Rapid depletion of local reservoirs is predicted due to intense agricultural extraction and shifting climate patterns.",
    chartData: [
      { name: "Agriculture", value: 40.0, color: "#eab308" },
      { name: "Built-Up", value: 20.0, color: "#ef4444" },
      { name: "Forest", value: 10.0, color: "#22c55e" },
      { name: "Water", value: 8.0, color: "#3b82f6" },
      { name: "Bare", value: 22.0, color: "#9ca3af" },
    ]
  },
  {
    id: "pred-6",
    title: "Industrial Corridor Development",
    predictedDistribution: { agriculture: 30.0, builtUp: 45.0, forest: 5.0, water: 5.0, bare: 15.0 },
    predictedAreaChangeSqKm: +22.0,
    growthPercentage: 42.0,
    confidence: 89,
    forecastPeriod: "10 Years (2036)",
    dominantClass: "Built-up Area",
    trend: 'increasing',
    interpretation: "Planned industrial zones will rapidly convert bare and agricultural land into massive paved and built-up complexes.",
    chartData: [
      { name: "Agriculture", value: 30.0, color: "#eab308" },
      { name: "Built-Up", value: 45.0, color: "#ef4444" },
      { name: "Forest", value: 5.0, color: "#22c55e" },
      { name: "Water", value: 5.0, color: "#3b82f6" },
      { name: "Bare", value: 15.0, color: "#9ca3af" },
    ]
  },
  {
    id: "pred-7",
    title: "Afforestation Success",
    predictedDistribution: { agriculture: 15.0, builtUp: 10.0, forest: 60.0, water: 10.0, bare: 5.0 },
    predictedAreaChangeSqKm: +18.4,
    growthPercentage: 25.0,
    confidence: 78,
    forecastPeriod: "10 Years (2036)",
    dominantClass: "Forest",
    trend: 'increasing',
    interpretation: "State-sponsored planting drives are projected to successfully convert large swaths of barren land into dense vegetation.",
    chartData: [
      { name: "Agriculture", value: 15.0, color: "#eab308" },
      { name: "Built-Up", value: 10.0, color: "#ef4444" },
      { name: "Forest", value: 60.0, color: "#22c55e" },
      { name: "Water", value: 10.0, color: "#3b82f6" },
      { name: "Bare", value: 5.0, color: "#9ca3af" },
    ]
  },
  {
    id: "pred-8",
    title: "Suburban Residential Sprawl",
    predictedDistribution: { agriculture: 45.0, builtUp: 35.0, forest: 10.0, water: 5.0, bare: 5.0 },
    predictedAreaChangeSqKm: +9.5,
    growthPercentage: 18.5,
    confidence: 93,
    forecastPeriod: "5 Years (2031)",
    dominantClass: "Agriculture",
    trend: 'increasing',
    interpretation: "Moderate but consistent housing development is eating into farmlands at the city's periphery.",
    chartData: [
      { name: "Agriculture", value: 45.0, color: "#eab308" },
      { name: "Built-Up", value: 35.0, color: "#ef4444" },
      { name: "Forest", value: 10.0, color: "#22c55e" },
      { name: "Water", value: 5.0, color: "#3b82f6" },
      { name: "Bare", value: 5.0, color: "#9ca3af" },
    ]
  },
  {
    id: "pred-9",
    title: "Desertification Risk",
    predictedDistribution: { agriculture: 10.0, builtUp: 5.0, forest: 15.0, water: 2.0, bare: 68.0 },
    predictedAreaChangeSqKm: +28.0,
    growthPercentage: 55.0,
    confidence: 84,
    forecastPeriod: "10 Years (2036)",
    dominantClass: "Bare",
    trend: 'increasing',
    interpretation: "Prolonged droughts and soil degradation are expected to vastly increase the proportion of barren, unusable land.",
    chartData: [
      { name: "Agriculture", value: 10.0, color: "#eab308" },
      { name: "Built-Up", value: 5.0, color: "#ef4444" },
      { name: "Forest", value: 15.0, color: "#22c55e" },
      { name: "Water", value: 2.0, color: "#3b82f6" },
      { name: "Bare", value: 68.0, color: "#9ca3af" },
    ]
  },
  {
    id: "pred-10",
    title: "Mixed Agro-Forestry Transition",
    predictedDistribution: { agriculture: 42.0, builtUp: 8.0, forest: 38.0, water: 7.0, bare: 5.0 },
    predictedAreaChangeSqKm: -2.1,
    growthPercentage: -3.5,
    confidence: 76,
    forecastPeriod: "5 Years (2031)",
    dominantClass: "Agriculture",
    trend: 'stable',
    interpretation: "A balanced transition toward agro-forestry is stabilizing the region, reducing bare land while maintaining crop output.",
    chartData: [
      { name: "Agriculture", value: 42.0, color: "#eab308" },
      { name: "Built-Up", value: 8.0, color: "#ef4444" },
      { name: "Forest", value: 38.0, color: "#22c55e" },
      { name: "Water", value: 7.0, color: "#3b82f6" },
      { name: "Bare", value: 5.0, color: "#9ca3af" },
    ]
  }
];

export type RiskDemoDataset = {
  id: string;
  title: string;
  overallRisk: number;
  anomalyScore: number;
  vegetationRisk: number;
  urbanPressure: number;
  waterStress: number;
  environmentalRisk: number;
  hotspotCount: number;
  confidence: number;
  dominantRiskFactor: string;
  severityCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  interpretation: string;
  chartData: { name: string; value: number; fill: string }[];
};

export const riskDemoDatasets: RiskDemoDataset[] = [
  {
    id: "risk-1",
    title: "Severe Urban Encroachment",
    overallRisk: 88,
    anomalyScore: 92,
    vegetationRisk: 85,
    urbanPressure: 95,
    waterStress: 60,
    environmentalRisk: 75,
    hotspotCount: 14,
    confidence: 94,
    dominantRiskFactor: "Urban Pressure",
    severityCategory: 'Critical',
    interpretation: "Aggressive, unauthorized construction is rapidly encroaching on greenbelts, generating critical anomalies in historical growth patterns.",
    chartData: [
      { name: "Veg Loss", value: 85, fill: "#f59e0b" },
      { name: "Urban", value: 95, fill: "#ef4444" },
      { name: "Water", value: 60, fill: "#3b82f6" },
      { name: "Env", value: 75, fill: "#8b5cf6" },
    ]
  },
  {
    id: "risk-2",
    title: "Drought & Agricultural Stress",
    overallRisk: 78,
    anomalyScore: 82,
    vegetationRisk: 88,
    urbanPressure: 20,
    waterStress: 94,
    environmentalRisk: 70,
    hotspotCount: 8,
    confidence: 89,
    dominantRiskFactor: "Water Stress",
    severityCategory: 'High',
    interpretation: "Severe depletion of surface water is causing widespread crop failure and vegetation anomalies across the region.",
    chartData: [
      { name: "Veg Loss", value: 88, fill: "#f59e0b" },
      { name: "Urban", value: 20, fill: "#ef4444" },
      { name: "Water", value: 94, fill: "#3b82f6" },
      { name: "Env", value: 70, fill: "#8b5cf6" },
    ]
  },
  {
    id: "risk-3",
    title: "Stable Rural Landscape",
    overallRisk: 15,
    anomalyScore: 12,
    vegetationRisk: 18,
    urbanPressure: 10,
    waterStress: 22,
    environmentalRisk: 15,
    hotspotCount: 0,
    confidence: 96,
    dominantRiskFactor: "None",
    severityCategory: 'Low',
    interpretation: "The area exhibits normal seasonal variations with no significant structural changes or environmental threats detected.",
    chartData: [
      { name: "Veg Loss", value: 18, fill: "#f59e0b" },
      { name: "Urban", value: 10, fill: "#ef4444" },
      { name: "Water", value: 22, fill: "#3b82f6" },
      { name: "Env", value: 15, fill: "#8b5cf6" },
    ]
  },
  {
    id: "risk-4",
    title: "Industrial Pollution Hotspot",
    overallRisk: 84,
    anomalyScore: 89,
    vegetationRisk: 72,
    urbanPressure: 65,
    waterStress: 88,
    environmentalRisk: 98,
    hotspotCount: 11,
    confidence: 91,
    dominantRiskFactor: "Environmental",
    severityCategory: 'Critical',
    interpretation: "Spectral anomalies point to severe environmental degradation, likely chemical runoff affecting local water bodies and nearby vegetation.",
    chartData: [
      { name: "Veg Loss", value: 72, fill: "#f59e0b" },
      { name: "Urban", value: 65, fill: "#ef4444" },
      { name: "Water", value: 88, fill: "#3b82f6" },
      { name: "Env", value: 98, fill: "#8b5cf6" },
    ]
  },
  {
    id: "risk-5",
    title: "Moderate Deforestation",
    overallRisk: 55,
    anomalyScore: 60,
    vegetationRisk: 75,
    urbanPressure: 45,
    waterStress: 30,
    environmentalRisk: 50,
    hotspotCount: 4,
    confidence: 83,
    dominantRiskFactor: "Vegetation Loss",
    severityCategory: 'Moderate',
    interpretation: "Scattered logging activities are creating moderate structural anomalies in the forest canopy, requiring monitoring.",
    chartData: [
      { name: "Veg Loss", value: 75, fill: "#f59e0b" },
      { name: "Urban", value: 45, fill: "#ef4444" },
      { name: "Water", value: 30, fill: "#3b82f6" },
      { name: "Env", value: 50, fill: "#8b5cf6" },
    ]
  },
  {
    id: "risk-6",
    title: "Flash Flood Vulnerability",
    overallRisk: 72,
    anomalyScore: 78,
    vegetationRisk: 40,
    urbanPressure: 55,
    waterStress: 85,
    environmentalRisk: 82,
    hotspotCount: 7,
    confidence: 87,
    dominantRiskFactor: "Water/Environmental",
    severityCategory: 'High',
    interpretation: "Loss of riparian vegetation combined with increased upstream pavement creates high vulnerability to sudden hydrological anomalies.",
    chartData: [
      { name: "Veg Loss", value: 40, fill: "#f59e0b" },
      { name: "Urban", value: 55, fill: "#ef4444" },
      { name: "Water", value: 85, fill: "#3b82f6" },
      { name: "Env", value: 82, fill: "#8b5cf6" },
    ]
  },
  {
    id: "risk-7",
    title: "Managed Agricultural Shift",
    overallRisk: 35,
    anomalyScore: 45,
    vegetationRisk: 50,
    urbanPressure: 15,
    waterStress: 40,
    environmentalRisk: 30,
    hotspotCount: 2,
    confidence: 90,
    dominantRiskFactor: "Vegetation Shift",
    severityCategory: 'Low',
    interpretation: "Anomalies reflect planned crop rotation and field restructuring rather than destructive risk factors.",
    chartData: [
      { name: "Veg Loss", value: 50, fill: "#f59e0b" },
      { name: "Urban", value: 15, fill: "#ef4444" },
      { name: "Water", value: 40, fill: "#3b82f6" },
      { name: "Env", value: 30, fill: "#8b5cf6" },
    ]
  },
  {
    id: "risk-8",
    title: "Peri-urban Infrastructure Shock",
    overallRisk: 81,
    anomalyScore: 95,
    vegetationRisk: 65,
    urbanPressure: 90,
    waterStress: 45,
    environmentalRisk: 60,
    hotspotCount: 12,
    confidence: 92,
    dominantRiskFactor: "Urban Pressure",
    severityCategory: 'High',
    interpretation: "A sudden spike in massive earth-moving operations is generating profound spectral anomalies at the city edge.",
    chartData: [
      { name: "Veg Loss", value: 65, fill: "#f59e0b" },
      { name: "Urban", value: 90, fill: "#ef4444" },
      { name: "Water", value: 45, fill: "#3b82f6" },
      { name: "Env", value: 60, fill: "#8b5cf6" },
    ]
  },
  {
    id: "risk-9",
    title: "Mining/Quarrying Expansion",
    overallRisk: 89,
    anomalyScore: 88,
    vegetationRisk: 92,
    urbanPressure: 30,
    waterStress: 70,
    environmentalRisk: 95,
    hotspotCount: 9,
    confidence: 88,
    dominantRiskFactor: "Environmental",
    severityCategory: 'Critical',
    interpretation: "Rapid expansion of surface extraction is destroying local ecosystems and creating high-risk environmental dead zones.",
    chartData: [
      { name: "Veg Loss", value: 92, fill: "#f59e0b" },
      { name: "Urban", value: 30, fill: "#ef4444" },
      { name: "Water", value: 70, fill: "#3b82f6" },
      { name: "Env", value: 95, fill: "#8b5cf6" },
    ]
  },
  {
    id: "risk-10",
    title: "Balanced Ecosystem",
    overallRisk: 8,
    anomalyScore: 5,
    vegetationRisk: 10,
    urbanPressure: 12,
    waterStress: 8,
    environmentalRisk: 5,
    hotspotCount: 0,
    confidence: 98,
    dominantRiskFactor: "None",
    severityCategory: 'Low',
    interpretation: "High resilience and stability. The landscape demonstrates excellent natural regeneration with virtually zero high-risk anomalies.",
    chartData: [
      { name: "Veg Loss", value: 10, fill: "#f59e0b" },
      { name: "Urban", value: 12, fill: "#ef4444" },
      { name: "Water", value: 8, fill: "#3b82f6" },
      { name: "Env", value: 5, fill: "#8b5cf6" },
    ]
  }
];

export type SuitabilityDemoDataset = {
  id: string;
  title: string;
  overallSuitability: number;
  agricultureSuitability: number;
  urbanSuitability: number;
  conservationSuitability: number;
  infrastructureSuitability: number;
  waterSuitability: number;
  recommendedZone: string;
  limitingFactor: string;
  confidence: number;
  suitableAreaSqKm: number;
  unsuitableAreaSqKm: number;
  suitabilityCategory: 'Poor' | 'Marginal' | 'Moderate' | 'Good' | 'Excellent';
  interpretation: string;
  chartData: { subject: string; A: number; fullMark: number }[];
};

export const suitabilityDemoDatasets: SuitabilityDemoDataset[] = [
  {
    id: "suit-1",
    title: "Prime Agricultural Land",
    overallSuitability: 88,
    agricultureSuitability: 95,
    urbanSuitability: 35,
    conservationSuitability: 40,
    infrastructureSuitability: 45,
    waterSuitability: 85,
    recommendedZone: "Agriculture / Farming",
    limitingFactor: "Urban Development (Policy)",
    confidence: 92,
    suitableAreaSqKm: 124.5,
    unsuitableAreaSqKm: 15.2,
    suitabilityCategory: 'Excellent',
    interpretation: "Rich alluvial soils and excellent drainage make this area highly suitable for intensive agriculture. Urban development should be strictly restricted.",
    chartData: [
      { subject: 'Agriculture', A: 95, fullMark: 100 },
      { subject: 'Urban', A: 35, fullMark: 100 },
      { subject: 'Conservation', A: 40, fullMark: 100 },
      { subject: 'Infrastructure', A: 45, fullMark: 100 },
      { subject: 'Water Resources', A: 85, fullMark: 100 },
    ]
  },
  {
    id: "suit-2",
    title: "Ideal Urban Development Zone",
    overallSuitability: 82,
    agricultureSuitability: 20,
    urbanSuitability: 92,
    conservationSuitability: 15,
    infrastructureSuitability: 88,
    waterSuitability: 70,
    recommendedZone: "High-Density Urban",
    limitingFactor: "Ecological Value",
    confidence: 89,
    suitableAreaSqKm: 85.0,
    unsuitableAreaSqKm: 32.4,
    suitabilityCategory: 'Good',
    interpretation: "Stable bedrock, existing transport links, and low agricultural value make this an optimal corridor for immediate urban expansion.",
    chartData: [
      { subject: 'Agriculture', A: 20, fullMark: 100 },
      { subject: 'Urban', A: 92, fullMark: 100 },
      { subject: 'Conservation', A: 15, fullMark: 100 },
      { subject: 'Infrastructure', A: 88, fullMark: 100 },
      { subject: 'Water Resources', A: 70, fullMark: 100 },
    ]
  },
  {
    id: "suit-3",
    title: "Strict Conservation Area",
    overallSuitability: 75,
    agricultureSuitability: 15,
    urbanSuitability: 5,
    conservationSuitability: 98,
    infrastructureSuitability: 10,
    waterSuitability: 90,
    recommendedZone: "Protected Forest",
    limitingFactor: "Topography & Biodiversity",
    confidence: 96,
    suitableAreaSqKm: 210.5,
    unsuitableAreaSqKm: 5.0,
    suitabilityCategory: 'Excellent',
    interpretation: "High biodiversity, steep slopes, and critical water catchments demand absolute conservation. Development is highly unsuitable.",
    chartData: [
      { subject: 'Agriculture', A: 15, fullMark: 100 },
      { subject: 'Urban', A: 5, fullMark: 100 },
      { subject: 'Conservation', A: 98, fullMark: 100 },
      { subject: 'Infrastructure', A: 10, fullMark: 100 },
      { subject: 'Water Resources', A: 90, fullMark: 100 },
    ]
  },
  {
    id: "suit-4",
    title: "Water-Constrained Mixed Use",
    overallSuitability: 45,
    agricultureSuitability: 35,
    urbanSuitability: 55,
    conservationSuitability: 40,
    infrastructureSuitability: 60,
    waterSuitability: 15,
    recommendedZone: "Light Commercial",
    limitingFactor: "Severe Water Scarcity",
    confidence: 84,
    suitableAreaSqKm: 42.0,
    unsuitableAreaSqKm: 85.5,
    suitabilityCategory: 'Poor',
    interpretation: "Severe groundwater depletion limits both agriculture and dense urban development. Only water-efficient light infrastructure is recommended.",
    chartData: [
      { subject: 'Agriculture', A: 35, fullMark: 100 },
      { subject: 'Urban', A: 55, fullMark: 100 },
      { subject: 'Conservation', A: 40, fullMark: 100 },
      { subject: 'Infrastructure', A: 60, fullMark: 100 },
      { subject: 'Water Resources', A: 15, fullMark: 100 },
    ]
  },
  {
    id: "suit-5",
    title: "Logistics & Industrial Hub",
    overallSuitability: 85,
    agricultureSuitability: 25,
    urbanSuitability: 70,
    conservationSuitability: 10,
    infrastructureSuitability: 95,
    waterSuitability: 50,
    recommendedZone: "Industrial/Logistics",
    limitingFactor: "Environmental Quality",
    confidence: 90,
    suitableAreaSqKm: 65.2,
    unsuitableAreaSqKm: 22.8,
    suitabilityCategory: 'Good',
    interpretation: "Flat terrain near existing highways makes this highly suitable for large-scale logistics and industrial parks.",
    chartData: [
      { subject: 'Agriculture', A: 25, fullMark: 100 },
      { subject: 'Urban', A: 70, fullMark: 100 },
      { subject: 'Conservation', A: 10, fullMark: 100 },
      { subject: 'Infrastructure', A: 95, fullMark: 100 },
      { subject: 'Water Resources', A: 50, fullMark: 100 },
    ]
  },
  {
    id: "suit-6",
    title: "Eco-Tourism & Agroforestry",
    overallSuitability: 78,
    agricultureSuitability: 65,
    urbanSuitability: 20,
    conservationSuitability: 85,
    infrastructureSuitability: 30,
    waterSuitability: 75,
    recommendedZone: "Agroforestry / Eco-tourism",
    limitingFactor: "Heavy Infrastructure",
    confidence: 88,
    suitableAreaSqKm: 145.0,
    unsuitableAreaSqKm: 45.0,
    suitabilityCategory: 'Good',
    interpretation: "A beautiful, moderately sloped landscape perfectly suited for sustainable agroforestry and low-impact eco-tourism.",
    chartData: [
      { subject: 'Agriculture', A: 65, fullMark: 100 },
      { subject: 'Urban', A: 20, fullMark: 100 },
      { subject: 'Conservation', A: 85, fullMark: 100 },
      { subject: 'Infrastructure', A: 30, fullMark: 100 },
      { subject: 'Water Resources', A: 75, fullMark: 100 },
    ]
  },
  {
    id: "suit-7",
    title: "Flood-Prone Lowlands",
    overallSuitability: 35,
    agricultureSuitability: 50,
    urbanSuitability: 10,
    conservationSuitability: 70,
    infrastructureSuitability: 5,
    waterSuitability: 85,
    recommendedZone: "Wetland Conservation",
    limitingFactor: "High Flood Risk",
    confidence: 94,
    suitableAreaSqKm: 25.0,
    unsuitableAreaSqKm: 155.0,
    suitabilityCategory: 'Poor',
    interpretation: "Historical data indicates severe seasonal flooding. Urban and infrastructure development should be strictly prohibited.",
    chartData: [
      { subject: 'Agriculture', A: 50, fullMark: 100 },
      { subject: 'Urban', A: 10, fullMark: 100 },
      { subject: 'Conservation', A: 70, fullMark: 100 },
      { subject: 'Infrastructure', A: 5, fullMark: 100 },
      { subject: 'Water Resources', A: 85, fullMark: 100 },
    ]
  },
  {
    id: "suit-8",
    title: "Marginal Multi-Use Land",
    overallSuitability: 55,
    agricultureSuitability: 45,
    urbanSuitability: 40,
    conservationSuitability: 35,
    infrastructureSuitability: 50,
    waterSuitability: 40,
    recommendedZone: "Mixed Peri-Urban",
    limitingFactor: "Poor Soil Quality",
    confidence: 80,
    suitableAreaSqKm: 60.5,
    unsuitableAreaSqKm: 58.5,
    suitabilityCategory: 'Moderate',
    interpretation: "Average conditions across the board. Suitable for gradual, mixed peri-urban development without extensive heavy infrastructure.",
    chartData: [
      { subject: 'Agriculture', A: 45, fullMark: 100 },
      { subject: 'Urban', A: 40, fullMark: 100 },
      { subject: 'Conservation', A: 35, fullMark: 100 },
      { subject: 'Infrastructure', A: 50, fullMark: 100 },
      { subject: 'Water Resources', A: 40, fullMark: 100 },
    ]
  },
  {
    id: "suit-9",
    title: "High-Yield Horticulture",
    overallSuitability: 80,
    agricultureSuitability: 90,
    urbanSuitability: 25,
    conservationSuitability: 50,
    infrastructureSuitability: 40,
    waterSuitability: 88,
    recommendedZone: "Horticulture",
    limitingFactor: "Urban Sprawl",
    confidence: 86,
    suitableAreaSqKm: 95.0,
    unsuitableAreaSqKm: 20.0,
    suitabilityCategory: 'Good',
    interpretation: "Micro-climate and soil conditions are exceptionally suited for high-value horticulture and orchards.",
    chartData: [
      { subject: 'Agriculture', A: 90, fullMark: 100 },
      { subject: 'Urban', A: 25, fullMark: 100 },
      { subject: 'Conservation', A: 50, fullMark: 100 },
      { subject: 'Infrastructure', A: 40, fullMark: 100 },
      { subject: 'Water Resources', A: 88, fullMark: 100 },
    ]
  },
  {
    id: "suit-10",
    title: "Barren / Unsuitable Terrain",
    overallSuitability: 15,
    agricultureSuitability: 5,
    urbanSuitability: 10,
    conservationSuitability: 20,
    infrastructureSuitability: 15,
    waterSuitability: 5,
    recommendedZone: "Solar Farming",
    limitingFactor: "Topography & Soil Depletion",
    confidence: 97,
    suitableAreaSqKm: 5.0,
    unsuitableAreaSqKm: 215.0,
    suitabilityCategory: 'Poor',
    interpretation: "Harsh terrain and depleted soils make this area unsuitable for standard development, though it may be viable for large-scale solar installations.",
    chartData: [
      { subject: 'Agriculture', A: 5, fullMark: 100 },
      { subject: 'Urban', A: 10, fullMark: 100 },
      { subject: 'Conservation', A: 20, fullMark: 100 },
      { subject: 'Infrastructure', A: 15, fullMark: 100 },
      { subject: 'Water Resources', A: 5, fullMark: 100 },
    ]
  }
];
