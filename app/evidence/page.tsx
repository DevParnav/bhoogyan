"use client";

import { useState } from 'react';
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

const mockEvidence: Evidence[] = [
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
    title: "LULC Change Detection 2015-2025",
    sourceType: "GIS",
    domain: "Geospatial",
    location: "Mulshi Taluka",
    date: "2025-01-10",
    accessLevel: "Restricted",
    provenance: "BhooGyan Satellite Pipeline (Sentinel-2)",
    excerpt: "Classification output indicates significant conversion from 'Vegetation/Cropland' to 'Built-up Area' along the Hinjewadi-Marunji axis."
  },
  {
    id: "ev-004",
    title: "Maharashtra Agricultural Lands (Ceiling on Holdings) Act",
    sourceType: "Legal",
    domain: "Land Rights",
    location: "Maharashtra State",
    date: "1961 (Updated 2022)",
    accessLevel: "Public",
    provenance: "Law Judiciary Department, Govt of Maharashtra",
    excerpt: "Limits on holding agricultural land and restrictions on transfer of agricultural land to non-agriculturists."
  }
];

export default function EvidenceExplorer() {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col h-full space-y-6 relative">
      <Header 
        breadcrumbs={[{ label: 'Evidence Explorer' }]}
        title="Evidence Explorer"
        subtitle="Discover and filter verified land-governance evidence."
      />
      
      <div className="flex gap-6 flex-1 h-[calc(100vh-14rem)]">
        {/* Main List */}
        <div className={`flex-1 space-y-6 transition-all h-full overflow-y-auto pr-2 ${selectedEvidence ? 'w-2/3' : 'w-full'}`}>
          {/* Filters */}
        <div className="bg-surface p-4 rounded-xl shadow-sm border border-border flex flex-wrap gap-4 items-center text-sm">
          <span className="font-semibold text-text-secondary mr-2">Filters:</span>
          <select className="border border-border rounded p-2 bg-muted text-foreground">
            <option>All Source Types</option>
            <option>Research</option>
            <option>Policy</option>
            <option>Legal</option>
            <option>GIS</option>
            <option>Satellite</option>
          </select>
          <select className="border border-border rounded p-2 bg-muted text-foreground">
            <option>All Domains</option>
            <option>Land Use</option>
            <option>Urban Planning</option>
          </select>
          <select className="border border-border rounded p-2 bg-muted text-foreground">
            <option>Location: All</option>
            <option>Pune District</option>
          </select>
          <select className="border border-border rounded p-2 bg-muted text-foreground">
            <option>Access Level: All</option>
            <option>Public</option>
            <option>Official</option>
          </select>
          <input type="date" className="border border-border rounded p-2 bg-muted text-foreground" />
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 space-y-4">
          {mockEvidence.map((ev) => (
            <div 
              key={ev.id} 
              onClick={() => setSelectedEvidence(ev)}
              className={`bg-surface p-5 rounded-xl shadow-sm border cursor-pointer transition-colors ${selectedEvidence?.id === ev.id ? 'border-evidence ring-1 ring-primary' : 'border-border hover:border-evidence'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-semibold bg-border text-evidence px-2 py-1 rounded">{ev.sourceType}</span>
                  <span className="text-xs text-text-secondary">{ev.date}</span>
                </div>
                <span className="text-xs font-medium text-text-secondary border border-border px-2 py-1 rounded">{ev.accessLevel}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{ev.title}</h3>
              <p className="text-sm text-text-secondary mb-3">{ev.domain} • 📍 {ev.location}</p>
              <p className="text-sm text-foreground line-clamp-2">{ev.excerpt}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Evidence Viewer (Side Panel) */}
      {selectedEvidence && (
        <div className="w-1/3 bg-surface rounded-xl shadow-lg border border-evidence sticky top-8 h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-right-8 duration-300">
          <div className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-surface">
            <h2 className="font-bold text-evidence">Evidence Viewer</h2>
            <button onClick={() => setSelectedEvidence(null)} className="text-text-secondary hover:text-foreground text-xl leading-none">&times;</button>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <span className="text-xs font-semibold bg-border text-evidence px-2 py-1 rounded mb-3 inline-block">{selectedEvidence.sourceType}</span>
              <h3 className="text-xl font-bold text-foreground mb-2">{selectedEvidence.title}</h3>
              <div className="text-sm text-text-secondary space-y-1">
                <p><strong>Date:</strong> {selectedEvidence.date}</p>
                <p><strong>Location:</strong> {selectedEvidence.location}</p>
                <p><strong>Domain:</strong> {selectedEvidence.domain}</p>
                <p><strong>Access:</strong> {selectedEvidence.accessLevel}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Provenance</h4>
              <p className="text-sm text-foreground bg-muted p-3 rounded border border-border">{selectedEvidence.provenance}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Relevant Excerpt</h4>
              <p className="text-sm text-foreground leading-relaxed italic border-l-4 border-evidence pl-4">{selectedEvidence.excerpt}</p>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Related Artifacts</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-evidence hover:underline">📄 Related Research: Impact Analysis 2023</a></li>
                <li><a href="/gis" className="text-evidence hover:underline">🗺️ GIS Layer: Mulshi LULC Change</a></li>
                <li><a href="#" className="text-evidence hover:underline">📊 Dataset: Crop Yield Stats</a></li>
              </ul>
            </div>

            <div className="pt-6">
              <button className="w-full bg-evidence text-white py-2 rounded-lg font-medium hover:bg-evidence/90 transition-colors">
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
