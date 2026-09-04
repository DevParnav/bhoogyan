"use client";

import { useState, useMemo } from 'react';
import Header from '@/components/Header';

type Evidence = {
  id: string;
  title: string;
  sourceType: string;
  domain: string;
  location: string;
  date: string;
  accessLevel: string;
  provenance: string;
  excerpt: string;
};

const domainColors: Record<string, string> = {
  "Land Use":          "bg-evidence-light text-evidence-dark border-evidence/20",
  "Urban Planning":    "bg-gis-light text-gis-dark border-gis/20",
  "Geospatial":        "bg-gis-light text-gis-dark border-gis/20",
  "Land Rights":       "bg-policy-light text-policy-dark border-policy/20",
  "Environment":       "bg-ai-light text-ai-dark border-ai/20",
  "Water Resources":   "bg-ai-light text-ai-dark border-ai/20",
  "Agriculture":       "bg-evidence-light text-evidence-dark border-evidence/20",
  "Infrastructure":    "bg-brand-light text-brand border-brand/20",
  "Biodiversity":      "bg-ai-light text-ai-dark border-ai/20",
  "Climate":           "bg-policy-light text-policy-dark border-policy/20",
  "Heritage":          "bg-policy-light text-policy-dark border-policy/20",
  "Socioeconomic":     "bg-brand-light text-brand border-brand/20",
  "Disaster Risk":     "bg-policy-light text-policy-dark border-policy/20",
  "Public Health":     "bg-evidence-light text-evidence-dark border-evidence/20",
};

const sourceTypeColors: Record<string, string> = {
  Research:   "bg-evidence/10 text-evidence border-evidence/30",
  Policy:     "bg-gis/10 text-gis border-gis/30",
  Legal:      "bg-policy/10 text-policy border-policy/30",
  GIS:        "bg-ai/10 text-ai border-ai/30",
  Satellite:  "bg-brand/10 text-brand border-brand/30",
  Report:     "bg-foreground/10 text-foreground border-border",
};

const mockEvidence: Evidence[] = [
  // ── LAND USE ─────────────────────────────────────────────────────────────
  {
    id: "ev-001",
    title: "Urban Sprawl and Agricultural Loss in Western Maharashtra",
    sourceType: "Research",
    domain: "Land Use",
    location: "Pune District",
    date: "2024-03-12",
    accessLevel: "Public",
    provenance: "Journal of Spatial Science, Vol 45.",
    excerpt: "The study demonstrates a 22% reduction in arable land in the Mulshi and Maval talukas between 2015 and 2024, directly correlated with the announcement of the Pune Ring Road."
  },
  {
    id: "ev-002",
    title: "Pune Metropolitan Regional Plan 2041",
    sourceType: "Policy",
    domain: "Urban Planning",
    location: "PMRDA Region",
    date: "2023-11-05",
    accessLevel: "Official",
    provenance: "Pune Metropolitan Region Development Authority (PMRDA)",
    excerpt: "Section 4.2 outlines the rezoning of 1,200 hectares of previously designated agricultural land to mixed-use development corridors to support projected population growth."
  },
  {
    id: "ev-003",
    title: "LULC Change Detection 2015–2025",
    sourceType: "GIS",
    domain: "Geospatial",
    location: "Mulshi Taluka",
    date: "2025-01-10",
    accessLevel: "Restricted",
    provenance: "BhooGyan Satellite Pipeline (Sentinel-2)",
    excerpt: "Classification output indicates significant conversion from 'Vegetation/Cropland' to 'Built-up Area' along the Hinjewadi–Marunji axis, with a net built-up gain of 840 ha."
  },
  {
    id: "ev-004",
    title: "Maharashtra Agricultural Lands (Ceiling on Holdings) Act",
    sourceType: "Legal",
    domain: "Land Rights",
    location: "Maharashtra State",
    date: "1961 (Updated 2022)",
    accessLevel: "Public",
    provenance: "Law & Judiciary Department, Govt of Maharashtra",
    excerpt: "Limits on holding agricultural land and restrictions on transfer of agricultural land to non-agriculturists. 2022 amendment lowers ceiling threshold in peri-urban zones."
  },
  {
    id: "ev-005",
    title: "Illegal Land Conversion Hotspot Analysis — Pune Periphery",
    sourceType: "Satellite",
    domain: "Land Use",
    location: "Pune Periphery",
    date: "2024-08-22",
    accessLevel: "Restricted",
    provenance: "ISRO Resourcesat-2A (LISS-IV) — BhooGyan Pipeline",
    excerpt: "Temporal comparison of LISS-IV imagery identifies 47 distinct hotspot polygons where agricultural-to-residential conversion occurred without verifiable permissions, concentrated in Haveli and Khed talukas."
  },
  {
    id: "ev-006",
    title: "Floor Space Index (FSI) Norms and Vertical Densification Trends",
    sourceType: "Policy",
    domain: "Urban Planning",
    location: "Pune Municipal Corporation",
    date: "2022-06-30",
    accessLevel: "Official",
    provenance: "Pune Municipal Corporation — Development Plan Cell",
    excerpt: "Revised FSI norms of 4.0 for transit-oriented zones near metro corridors have catalysed a 3× increase in high-rise permit applications between 2021 and 2023."
  },

  // ── ENVIRONMENT ──────────────────────────────────────────────────────────
  {
    id: "ev-007",
    title: "Pune District Environmental Status Report 2024",
    sourceType: "Report",
    domain: "Environment",
    location: "Pune District",
    date: "2024-04-15",
    accessLevel: "Public",
    provenance: "Maharashtra Pollution Control Board (MPCB)",
    excerpt: "PM2.5 levels in Hadapsar and Bhosari industrial zones exceed NAAQS standards on 112 days per year. Green cover declined by 18% in the PMC area since 2010."
  },
  {
    id: "ev-008",
    title: "Western Ghats Eco-Sensitive Zone Notification — Pune",
    sourceType: "Legal",
    domain: "Environment",
    location: "Sahyadri Ranges, Pune",
    date: "2022-08-09",
    accessLevel: "Public",
    provenance: "Ministry of Environment, Forest and Climate Change (MoEFCC)",
    excerpt: "Notified Eco-Sensitive Zones covering 13,000 km² in Western Ghats, restricting mining, quarrying, and large-scale construction within 1 km of ESZ boundary areas in Pune."
  },
  {
    id: "ev-009",
    title: "Tree Census and Urban Canopy Assessment — PMC 2023",
    sourceType: "Report",
    domain: "Environment",
    location: "Pune City",
    date: "2023-07-20",
    accessLevel: "Public",
    provenance: "PMC Garden Department & IIT Pune Remote Sensing Lab",
    excerpt: "Total tree count of 1.07 million within PMC limits, with only 8.2% urban canopy cover — significantly below the 33% recommended by the National Forest Policy."
  },
  {
    id: "ev-010",
    title: "Air Quality Index Monitoring — Seasonal Variation Study",
    sourceType: "Research",
    domain: "Environment",
    location: "Pune City",
    date: "2024-01-18",
    accessLevel: "Public",
    provenance: "IISER Pune — Environmental Sciences Division",
    excerpt: "Seasonal AQI analysis across 14 monitoring stations shows worst air quality during Oct–Jan post-harvest burning season, with Katraj and Swargate consistently in 'Poor' category."
  },

  // ── WATER RESOURCES ──────────────────────────────────────────────────────
  {
    id: "ev-011",
    title: "Mula-Mutha River Rejuvenation Action Plan",
    sourceType: "Policy",
    domain: "Water Resources",
    location: "Mula-Mutha River Corridor",
    date: "2023-09-12",
    accessLevel: "Official",
    provenance: "National Mission for Clean Ganga (NMCG) & PMC",
    excerpt: "₹4,200 Cr plan to treat 580 MLD of sewage currently entering the river, restore 11 km of riverfront, and demarcate 200m flood plain buffer from encroachments."
  },
  {
    id: "ev-012",
    title: "Groundwater Level Trends — Pune Division 2010–2024",
    sourceType: "Research",
    domain: "Water Resources",
    location: "Pune Division",
    date: "2024-02-28",
    accessLevel: "Public",
    provenance: "Central Ground Water Board (CGWB) — Pune Regional Office",
    excerpt: "Pre-monsoon groundwater levels have declined by an average of 2.3 metres across the Pune plateau over 14 years, driven by rapid impervious surface growth reducing recharge areas."
  },
  {
    id: "ev-013",
    title: "Khadakwasla Reservoir Catchment: Encroachment Mapping",
    sourceType: "GIS",
    domain: "Water Resources",
    location: "Khadakwasla, Pune",
    date: "2024-10-05",
    accessLevel: "Restricted",
    provenance: "BhooGyan Sentinel-2 Pipeline + WRIS Data",
    excerpt: "Satellite-derived encroachment polygons covering 620 ha within the reservoir's designated catchment zone. Over 340 structures identified in direct buffer violations."
  },
  {
    id: "ev-014",
    title: "Water Supply Coverage and NRW Assessment — PMC",
    sourceType: "Report",
    domain: "Water Resources",
    location: "Pune Municipal Corporation",
    date: "2023-12-01",
    accessLevel: "Official",
    provenance: "PMC Hydraulic Department",
    excerpt: "Non-Revenue Water (NRW) stands at 38% of total water supplied, indicating significant distribution losses. Per-capita supply of 180 LPCD covers 94% of residents, but coverage drops to 65% in newly merged villages."
  },

  // ── AGRICULTURE ──────────────────────────────────────────────────────────
  {
    id: "ev-015",
    title: "Farmer Distress and Land Alienation in Mawal Taluka",
    sourceType: "Research",
    domain: "Agriculture",
    location: "Mawal Taluka, Pune",
    date: "2023-05-17",
    accessLevel: "Public",
    provenance: "Gokhale Institute of Politics and Economics, Pune",
    excerpt: "A structured survey of 412 farm households in Mawal reveals that 68% of land transactions were distress-driven sales, with real-estate developers as primary buyers at 30–40% below market rates."
  },
  {
    id: "ev-016",
    title: "Onion Cultivation and Market Linkage Study — Khed & Shirur",
    sourceType: "Research",
    domain: "Agriculture",
    location: "Khed & Shirur Talukas",
    date: "2022-11-22",
    accessLevel: "Public",
    provenance: "Agharkar Research Institute, Pune",
    excerpt: "Onion belt of Khed and Shirur contributes 18% of Maharashtra's output, yet price volatility causes average farm-gate losses of ₹3,200 per quintal in surplus seasons. Cold storage penetration is under 12%."
  },
  {
    id: "ev-017",
    title: "PM-KISAN Beneficiary Land Records — Pune District",
    sourceType: "Policy",
    domain: "Agriculture",
    location: "Pune District",
    date: "2024-06-01",
    accessLevel: "Official",
    provenance: "District Agriculture Office, Pune",
    excerpt: "2.4 lakh PM-KISAN beneficiaries enrolled in Pune district. 14% of applications rejected due to land record discrepancies — primarily in Bhor, Velhe, and Ambegaon talukas where satbara records are disputed."
  },

  // ── INFRASTRUCTURE ───────────────────────────────────────────────────────
  {
    id: "ev-018",
    title: "Pune Ring Road Alignment and Land Acquisition Status",
    sourceType: "Policy",
    domain: "Infrastructure",
    location: "Pune Periphery",
    date: "2024-07-14",
    accessLevel: "Official",
    provenance: "Maharashtra State Road Development Corporation (MSRDC)",
    excerpt: "128 km ring road requiring land acquisition from 23 talukas. As of Q2 2024, 62% of required land acquired; 38 villages have filed objections under the RFCTLARR Act against compensation assessments."
  },
  {
    id: "ev-019",
    title: "Pune Metro Ridership and Transit-Oriented Development Study",
    sourceType: "Research",
    domain: "Infrastructure",
    location: "Pune City",
    date: "2024-05-10",
    accessLevel: "Public",
    provenance: "Centre for Urban Equity, CEPT University",
    excerpt: "Actual ridership on Phase-1 corridors is 38% below projections. Study attributes gap to last-mile connectivity failures and inadequate pedestrian infrastructure within 500m of 19 of 24 operational stations."
  },
  {
    id: "ev-020",
    title: "Industrial Estate Expansion: MIDC Chakan Phase III EIA",
    sourceType: "Report",
    domain: "Infrastructure",
    location: "Chakan, Khed Taluka",
    date: "2023-03-08",
    accessLevel: "Official",
    provenance: "MIDC & Environmental Impact Assessment Authority, MoEFCC",
    excerpt: "Phase III expansion covers 2,400 ha and will displace 6 villages partially. EIA recommends mandatory groundwater recharge structures, acoustic barriers along NH48, and a 10 km2 compensatory afforestation zone."
  },

  // ── BIODIVERSITY ─────────────────────────────────────────────────────────
  {
    id: "ev-021",
    title: "Biodiversity Corridors in Pune District — Connectivity Analysis",
    sourceType: "Research",
    domain: "Biodiversity",
    location: "Pune District",
    date: "2023-10-05",
    accessLevel: "Public",
    provenance: "Wildlife Institute of India (WII)",
    excerpt: "Three critical leopard corridors connecting Sinhagad–Bhuleshwar–Saswad forests are under severe fragmentation threat from NH expansion and quarrying. Corridor width has narrowed from 2.1 km to 600m in 8 years."
  },
  {
    id: "ev-022",
    title: "Wetland Inventory and Ecosystem Services — Pune Plateau",
    sourceType: "GIS",
    domain: "Biodiversity",
    location: "Pune Plateau",
    date: "2024-09-15",
    accessLevel: "Public",
    provenance: "Salim Ali Centre for Ornithology and Natural History (SACON)",
    excerpt: "Inventory of 78 wetlands on Pune plateau: 34 classified as 'ecologically significant'. 21 have lost over 50% area since 2005 to urban encroachment. 12 support nationally threatened bird species."
  },

  // ── CLIMATE ──────────────────────────────────────────────────────────────
  {
    id: "ev-023",
    title: "Pune Climate Action Plan 2030",
    sourceType: "Policy",
    domain: "Climate",
    location: "Pune City",
    date: "2023-08-20",
    accessLevel: "Official",
    provenance: "PMC Climate Cell & ICLEI South Asia",
    excerpt: "Plan targets a 45% reduction in city-wide GHG emissions by 2030, transitioning 30% of public fleet to EVs, increasing rooftop solar from 50 MW to 350 MW, and greening 40% of building rooftops."
  },
  {
    id: "ev-024",
    title: "Urban Heat Island Intensity Mapping — Pune 2023",
    sourceType: "Satellite",
    domain: "Climate",
    location: "Pune City",
    date: "2023-06-15",
    accessLevel: "Public",
    provenance: "NRSC / Landsat-8 LST Processing — BhooGyan",
    excerpt: "Land Surface Temperature differential between the urban core (Shivajinagar) and peri-urban green areas (Tamhini) reaches 8.4°C in peak summer, intensifying with impervious surface density."
  },
  {
    id: "ev-025",
    title: "Rainfall Anomaly and Cloudburst Risk Assessment",
    sourceType: "Research",
    domain: "Climate",
    location: "Pune District",
    date: "2024-07-30",
    accessLevel: "Public",
    provenance: "Indian Institute of Tropical Meteorology (IITM), Pune",
    excerpt: "36-year rainfall data shows a 27% increase in extreme rainfall events (>100mm/day) in the Pune region, with urban flooding risk concentrated in low-lying areas of Katraj, Wadgaon, and Parvati."
  },

  // ── HERITAGE ─────────────────────────────────────────────────────────────
  {
    id: "ev-026",
    title: "Heritage Precinct Conservation Plan — Shaniwar Wada Area",
    sourceType: "Policy",
    domain: "Heritage",
    location: "Pune City — Peth Areas",
    date: "2022-12-10",
    accessLevel: "Official",
    provenance: "INTACH Pune Chapter & PMC Heritage Cell",
    excerpt: "Plan identifies 214 grade-I and grade-II heritage structures in the old Peth areas. 68 buildings are under 'immediate risk' from unauthorized additions, structural neglect, and encroachment."
  },
  {
    id: "ev-027",
    title: "Archaeological Survey — Prehistoric Rock Art Sites, Junnar",
    sourceType: "Research",
    domain: "Heritage",
    location: "Junnar, Pune",
    date: "2023-04-18",
    accessLevel: "Restricted",
    provenance: "Deccan College Post-Graduate and Research Institute, Pune",
    excerpt: "New survey documents 38 previously unrecorded rock art panels across 12 sites in Junnar taluka. 9 sites are within 500m of proposed quarrying zones and at risk of irreversible damage."
  },

  // ── SOCIOECONOMIC ────────────────────────────────────────────────────────
  {
    id: "ev-028",
    title: "Informal Settlements and Tenure Insecurity — Pune 2024",
    sourceType: "Research",
    domain: "Socioeconomic",
    location: "Pune City",
    date: "2024-02-05",
    accessLevel: "Public",
    provenance: "Shelter Associates (NGO) & TISS Mumbai",
    excerpt: "580 informal settlements house approximately 4.7 lakh households in Pune. Only 22% have any form of tenure documentation. 38% are on hazardous land — river margins, railway buffers, or under transmission lines."
  },
  {
    id: "ev-029",
    title: "IT Corridor Growth and Income Inequality Trends",
    sourceType: "Research",
    domain: "Socioeconomic",
    location: "Hinjewadi–Kharadi Corridor",
    date: "2023-09-28",
    accessLevel: "Public",
    provenance: "Symbiosis Institute of Management Studies, Pune",
    excerpt: "GDP contribution from the IT corridor doubled to ₹1.8 lakh Cr between 2015–2023, but median worker housing expenditure rose 4× faster than median income, exacerbating spatial income inequality."
  },
  {
    id: "ev-030",
    title: "Migrant Worker Housing and Urban Integration Study",
    sourceType: "Report",
    domain: "Socioeconomic",
    location: "Pune & PCMC",
    date: "2023-11-14",
    accessLevel: "Public",
    provenance: "Centre for Labour Research and Action (CLRA) & PMC",
    excerpt: "Estimated 6.8 lakh seasonal migrants in Pune–PCMC contribute to construction, hospitality, and domestic sectors. 72% live in informal arrangements without any formal tenancy or social-security coverage."
  },

  // ── DISASTER RISK ────────────────────────────────────────────────────────
  {
    id: "ev-031",
    title: "Pune District Disaster Management Plan 2024–29",
    sourceType: "Policy",
    domain: "Disaster Risk",
    location: "Pune District",
    date: "2024-03-31",
    accessLevel: "Official",
    provenance: "Pune District Collector Office & NDMA",
    excerpt: "Plan maps 98 flood-prone settlements, 34 landslide-hazard zones in the Sahyadri foothills, and 12 urban areas with seismic vulnerability due to soft alluvial deposits."
  },
  {
    id: "ev-032",
    title: "2021 Mahad Landslide — Land Cover Change Analysis",
    sourceType: "Satellite",
    domain: "Disaster Risk",
    location: "Raigad–Pune Border",
    date: "2021-09-10",
    accessLevel: "Public",
    provenance: "NRSC Post-Disaster Assessment — Sentinel-1 SAR",
    excerpt: "SAR backscatter analysis delineates 12.4 ha main slide mass in Taliye village. Precursor deformation detected in InSAR time-series up to 3 weeks prior; slope failure attributed to slope deforestation and intense rainfall."
  },
  {
    id: "ev-033",
    title: "Flash Flood Risk Zones — Pune Urban Agglomeration",
    sourceType: "GIS",
    domain: "Disaster Risk",
    location: "Pune Urban Agglomeration",
    date: "2024-08-01",
    accessLevel: "Restricted",
    provenance: "BhooGyan Hydrological Modelling (HEC-RAS 2D)",
    excerpt: "2D hydraulic modelling identifies 37 km² of urban area at high flood risk for a 1-in-25-year event; 84,000 residents in Warje, Erandwane, and Dhayari in 'immediate evacuation' category."
  },

  // ── PUBLIC HEALTH ────────────────────────────────────────────────────────
  {
    id: "ev-034",
    title: "Solid Waste Management and Land Contamination — PMC",
    sourceType: "Report",
    domain: "Public Health",
    location: "Pune City",
    date: "2023-10-22",
    accessLevel: "Public",
    provenance: "PMC Solid Waste Management Dept & NEERI, Nagpur",
    excerpt: "Legacy waste at Uruli Devachi dumpsite (94 lakh MT legacy waste over 30 ha) shows heavy metal leachate contamination extending 1.8 km into surrounding farmlands, exceeding permissible limits for lead, cadmium, and chromium."
  },
  {
    id: "ev-035",
    title: "Vector-Borne Disease Hotspot Mapping — Dengue & Malaria",
    sourceType: "GIS",
    domain: "Public Health",
    location: "Pune City & Pimpri-Chinchwad",
    date: "2024-04-30",
    accessLevel: "Restricted",
    provenance: "PMC Health Department & NVBDCP",
    excerpt: "GIS clustering of 12,000 case records over 3 years identifies 18 persistent hotspot clusters in areas with poor drainage, high construction density, and informal water storage — concentrated in Yerawada, Hadapsar, and Bhosari."
  },
  {
    id: "ev-036",
    title: "Noise Pollution Survey Along Road Corridors — Pune 2023",
    sourceType: "Research",
    domain: "Public Health",
    location: "Pune City",
    date: "2023-08-05",
    accessLevel: "Public",
    provenance: "College of Engineering Pune (COEP) — Environmental Eng. Lab",
    excerpt: "Continuous noise monitoring at 22 locations reveals that 18 exceed the CPCB day-time limit of 65 dB (Residential). Night-time levels near Katraj–Kondhwa road average 72 dB, well above the 55 dB limit."
  },
];

const ALL_SOURCE_TYPES = ["Research", "Policy", "Legal", "GIS", "Satellite", "Report"];
const ALL_DOMAINS = [...new Set(mockEvidence.map(e => e.domain))].sort();
const ALL_LOCATIONS = [...new Set(mockEvidence.map(e => e.location))].sort();
const ALL_ACCESS = ["Public", "Official", "Restricted"];

export default function EvidenceExplorer() {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("All");
  const [filterDomain, setFilterDomain] = useState("All");
  const [filterAccess, setFilterAccess] = useState("All");

  const filtered = useMemo(() => {
    return mockEvidence.filter(ev => {
      const matchSearch =
        !search ||
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        ev.location.toLowerCase().includes(search.toLowerCase());
      const matchSource = filterSource === "All" || ev.sourceType === filterSource;
      const matchDomain = filterDomain === "All" || ev.domain === filterDomain;
      const matchAccess = filterAccess === "All" || ev.accessLevel === filterAccess;
      return matchSearch && matchSource && matchDomain && matchAccess;
    });
  }, [search, filterSource, filterDomain, filterAccess]);

  const selectClass =
    "border border-border rounded-lg px-3 py-2 bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-evidence/30 cursor-pointer";

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col h-full space-y-6 relative">
      <Header
        breadcrumbs={[{ label: "Evidence Explorer" }]}
        title="Evidence Explorer"
        subtitle={`${filtered.length} of ${mockEvidence.length} records — Pune region land-governance evidence database.`}
      />

      <div className="flex gap-6 flex-1 h-[calc(100vh-14rem)]">
        {/* Main List */}
        <div className={`flex flex-col gap-4 transition-all h-full overflow-y-auto pr-2 ${selectedEvidence ? "w-2/3" : "w-full"}`}>

          {/* Filters bar */}
          <div className="bg-surface p-4 rounded-xl shadow-sm border border-border flex flex-wrap gap-3 items-center text-sm sticky top-0 z-10">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search evidence…"
              className="border border-border rounded-lg px-3 py-2 bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-evidence/30 min-w-[180px] flex-1"
            />
            {/* Source Type */}
            <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className={selectClass}>
              <option value="All">All Source Types</option>
              {ALL_SOURCE_TYPES.map(s => <option key={s}>{s}</option>)}
            </select>
            {/* Domain */}
            <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)} className={selectClass}>
              <option value="All">All Domains</option>
              {ALL_DOMAINS.map(d => <option key={d}>{d}</option>)}
            </select>
            {/* Access */}
            <select value={filterAccess} onChange={e => setFilterAccess(e.target.value)} className={selectClass}>
              <option value="All">All Access Levels</option>
              {ALL_ACCESS.map(a => <option key={a}>{a}</option>)}
            </select>
            {/* Reset */}
            {(search || filterSource !== "All" || filterDomain !== "All" || filterAccess !== "All") && (
              <button
                onClick={() => { setSearch(""); setFilterSource("All"); setFilterDomain("All"); setFilterAccess("All"); }}
                className="text-xs text-evidence border border-evidence/30 rounded-lg px-3 py-2 hover:bg-evidence/5 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Category summary pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            {ALL_DOMAINS.map(d => {
              const count = mockEvidence.filter(e => e.domain === d).length;
              const active = filterDomain === d;
              return (
                <button
                  key={d}
                  onClick={() => setFilterDomain(active ? "All" : d)}
                  className={`px-3 py-1 rounded-full border font-medium transition-colors ${
                    active
                      ? (domainColors[d] ?? "bg-evidence-light text-evidence-dark border-evidence/20") + " ring-1 ring-current"
                      : "border-border text-text-secondary hover:border-evidence hover:text-evidence"
                  }`}
                >
                  {d} ({count})
                </button>
              );
            })}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="bg-surface rounded-xl p-12 border border-border text-center text-text-secondary">
              No evidence records match your filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvidence(ev.id === selectedEvidence?.id ? null : ev)}
                  className={`bg-surface p-5 rounded-xl shadow-sm border cursor-pointer transition-all ${
                    selectedEvidence?.id === ev.id
                      ? "border-evidence ring-1 ring-evidence"
                      : "border-border hover:border-evidence/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${sourceTypeColors[ev.sourceType] ?? "bg-border text-foreground border-border"}`}>
                        {ev.sourceType}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${domainColors[ev.domain] ?? "bg-muted text-foreground border-border"}`}>
                        {ev.domain}
                      </span>
                      <span className="text-xs text-text-secondary">{ev.date}</span>
                    </div>
                    <span className="text-xs font-medium text-text-secondary border border-border px-2 py-0.5 rounded shrink-0">
                      {ev.accessLevel}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{ev.title}</h3>
                  <p className="text-xs text-text-secondary mb-2">📍 {ev.location}</p>
                  <p className="text-sm text-foreground line-clamp-2">{ev.excerpt}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side Panel */}
        {selectedEvidence && (
          <div className="w-1/3 bg-surface rounded-xl shadow-lg border border-evidence sticky top-0 h-full overflow-y-auto">
            <div className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-surface z-10">
              <h2 className="font-bold text-evidence text-sm uppercase tracking-wide">Evidence Viewer</h2>
              <button onClick={() => setSelectedEvidence(null)} className="text-text-secondary hover:text-foreground text-xl leading-none">
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${sourceTypeColors[selectedEvidence.sourceType] ?? ""}`}>
                    {selectedEvidence.sourceType}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${domainColors[selectedEvidence.domain] ?? ""}`}>
                    {selectedEvidence.domain}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{selectedEvidence.title}</h3>
                <dl className="text-sm text-text-secondary space-y-1">
                  <div className="flex gap-2"><dt className="font-semibold text-foreground min-w-[70px]">Date</dt><dd>{selectedEvidence.date}</dd></div>
                  <div className="flex gap-2"><dt className="font-semibold text-foreground min-w-[70px]">Location</dt><dd>{selectedEvidence.location}</dd></div>
                  <div className="flex gap-2"><dt className="font-semibold text-foreground min-w-[70px]">Access</dt><dd>{selectedEvidence.accessLevel}</dd></div>
                </dl>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Provenance</h4>
                <p className="text-sm text-foreground bg-muted p-3 rounded border border-border">{selectedEvidence.provenance}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Relevant Excerpt</h4>
                <p className="text-sm text-foreground leading-relaxed italic border-l-4 border-evidence pl-4">{selectedEvidence.excerpt}</p>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Related Artifacts</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-evidence hover:underline">📄 Related Research: Impact Analysis 2023</a></li>
                  <li><a href="/gis" className="text-evidence hover:underline">🗺️ GIS Layer: {selectedEvidence.domain} Layer</a></li>
                  <li><a href="#" className="text-evidence hover:underline">📊 Dataset: Supporting Data Tables</a></li>
                </ul>
              </div>

              <div className="pt-2">
                <button className="w-full bg-evidence text-white py-2.5 rounded-lg font-medium hover:bg-evidence/90 transition-colors text-sm">
                  Add to Workspace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
