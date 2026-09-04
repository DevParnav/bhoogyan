"use client";

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function BhooNeeti() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSubmitted(true);
    }
  };

  const sampleQuery = "What are the major causes of agricultural land conversion around Pune?";

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8 flex flex-col h-full">
      <Header 
        breadcrumbs={[{ label: 'BhooNeeti' }]}
        title="BhooNeeti"
        subtitle="AI-assisted research & policy intelligence"
      />

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-accent">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a land-governance question..."
            className="flex-1 p-3 border border-accent rounded-lg focus:outline-none focus:border-primary text-foreground"
          />
          <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Ask BhooNeeti
          </button>
        </form>
        <div className="mt-3 flex gap-2 items-center flex-wrap">
          <span className="text-xs text-text-secondary">Try:</span>
          <button 
            onClick={() => setQuery(sampleQuery)}
            className="text-xs bg-background text-primary px-3 py-1.5 rounded border border-accent hover:border-primary transition-colors text-left"
          >
            {sampleQuery}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {submitted && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Question Understanding */}
          <section className="bg-white p-6 rounded-xl border border-accent shadow-sm">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Question Understanding</h2>
            <div className="flex flex-wrap gap-2">
              <span className="bg-accent/50 text-primary px-3 py-1 rounded-full text-sm">Theme: Land Conversion</span>
              <span className="bg-accent/50 text-primary px-3 py-1 rounded-full text-sm">Region: Pune (Mulshi, Maval)</span>
              <span className="bg-accent/50 text-primary px-3 py-1 rounded-full text-sm">Focus: Causal Analysis</span>
            </div>
          </section>

          {/* Relevant Evidence */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Relevant Evidence Found</h2>
              <Link href="/evidence" className="text-xs text-primary hover:underline">View all in Explorer →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Pune Metropolitan Regional Plan 2041", type: "Policy Document", date: "2023", relevance: "High", loc: "PMRDA Region" },
                { title: "Urban Sprawl and Agricultural Loss in Western Maharashtra", type: "Research Paper", date: "2024", relevance: "High", loc: "Pune District" },
                { title: "LULC Change Detection 2015-2025", type: "GIS Dataset", date: "2025", relevance: "High", loc: "Mulshi Taluka" },
                { title: "Infrastructure Corridor Impact Assessment", type: "Analysis Report", date: "2025", relevance: "Medium", loc: "Ring Road Alignment" }
              ].map((doc, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-accent hover:border-primary transition-colors cursor-pointer shadow-sm">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold text-primary">{doc.type}</span>
                    <span className="text-text-secondary">{doc.date}</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2 line-clamp-2">{doc.title}</h3>
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>📍 {doc.loc}</span>
                    <span>Relevance: {doc.relevance}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Synthesis */}
          <section className="bg-white p-8 rounded-xl border-2 border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg font-medium">AI Synthesis</div>
            
            <h2 className="text-xl font-bold text-primary mb-6">BhooNeeti Synthesis</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Key Finding
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  Agricultural land conversion around Pune is primarily driven by speculative land acquisition along proposed infrastructure corridors (notably the Ring Road) and the expansion of secondary IT hubs into peri-urban areas like Mulshi and Maval.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Supporting Evidence
                </h3>
                <ul className="list-disc pl-5 text-sm text-text-secondary space-y-2">
                  <li>The <span className="font-medium text-foreground">Pune Metropolitan Regional Plan 2041</span> indicates a 15% planned reduction in agricultural zoning to accommodate urban expansion.</li>
                  <li>Recent <span className="font-medium text-foreground">LULC Change Detection (2015-2025)</span> shows a direct correlation between highway proximity and conversion rates, with a 22% loss of arable land within 5km of new corridors.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Spatial Context
                </h3>
                <p className="text-text-secondary text-sm">
                  The highest intensity of conversion is localized in the western quadrant (Mulshi/Hinjewadi axis) and the northern corridor (Chakan). <Link href="/gis#change" className="text-primary hover:underline">View spatial distribution map →</Link>
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Policy Relevance
                </h3>
                <p className="text-text-secondary text-sm">
                  Current policies lack strict transfer-of-development-rights (TDR) enforcement in these specific eco-sensitive zones. This baseline trend suggests an urgent need for controlled development scenarios. <Link href="/policy" className="text-primary hover:underline">Open Policy Studio for simulations →</Link>
                </p>
              </div>

              <div className="pt-4 border-t border-accent mt-6">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Sources Cited</h3>
                <div className="flex gap-2 flex-wrap text-xs">
                  <span className="bg-background px-2 py-1 rounded border border-accent">Pune Regional Plan 2041 (Govt, 2023)</span>
                  <span className="bg-background px-2 py-1 rounded border border-accent">LULC Change Mulshi (GIS, 2025)</span>
                  <span className="bg-background px-2 py-1 rounded border border-accent">Urban Sprawl & Ag. Loss (Research, 2024)</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
