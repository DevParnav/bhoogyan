"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Message {
  id: string;
  role: 'user' | 'bhooneeti';
  content: string;
}

export default function BhooNeeti() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: query };
    const newBhooNeetiMsg: Message = { id: (Date.now() + 1).toString(), role: 'bhooneeti', content: 'demo' };
    
    setMessages(prev => [...prev, newUserMsg, newBhooNeetiMsg]);
    setQuery("");
  };

  const sampleQuery = "What are the major causes of agricultural land conversion around Pune?";

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-6 py-4 flex-shrink-0 border-b border-accent/50 bg-background/95 backdrop-blur z-10">
        <Header 
          breadcrumbs={[{ label: 'BhooNeeti' }]}
          title="BhooNeeti"
          subtitle="AI-assisted research & policy intelligence"
        />
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {messages.length === 0 ? (
          // STATE A: Empty State - Centered Composer
          <div className="flex-1 flex flex-col items-center justify-center p-6 transition-all duration-500 ease-in-out">
            <div className="max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-primary mb-6 text-center">Ask a land-governance question...</h2>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-accent">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="E.g., What are the major causes of land conversion?"
                    className="flex-1 p-3 border border-accent rounded-lg focus:outline-none focus:border-primary text-foreground"
                  />
                  <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Ask BhooNeeti
                  </button>
                </form>
                <div className="mt-4 flex gap-2 items-center flex-wrap justify-center">
                  <span className="text-xs text-text-secondary">Try:</span>
                  <button 
                    onClick={() => {
                      setQuery(sampleQuery);
                    }}
                    className="text-xs bg-background text-primary px-3 py-1.5 rounded border border-accent hover:border-primary transition-colors text-left"
                  >
                    {sampleQuery}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // STATE B: Chat State
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Scrollable Conversation */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              <div className="max-w-4xl mx-auto space-y-8 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    {msg.role === 'user' ? (
                      <div className="max-w-[80%]">
                        <div className="text-xs font-semibold text-text-secondary mb-1 ml-1 uppercase">User</div>
                        <div className="bg-primary text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="text-xs font-semibold text-primary mb-2 ml-1 uppercase tracking-wider">BhooNeeti</div>
                        
                        {/* Demo Result Rendered for every BhooNeeti message */}
                        <div className="space-y-6 w-full">
                          {/* Question Understanding */}
                          <section className="bg-white p-5 rounded-xl border border-accent shadow-sm">
                            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Question Understanding</h2>
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-accent/50 text-primary px-3 py-1 rounded-full text-xs font-medium">Theme: Land Conversion</span>
                              <span className="bg-accent/50 text-primary px-3 py-1 rounded-full text-xs font-medium">Region: Pune (Mulshi, Maval)</span>
                              <span className="bg-accent/50 text-primary px-3 py-1 rounded-full text-xs font-medium">Focus: Causal Analysis</span>
                            </div>
                          </section>

                          {/* Relevant Evidence */}
                          <section>
                            <div className="flex justify-between items-end mb-3">
                              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Relevant Evidence Found</h2>
                              <Link href="/evidence" className="text-xs text-primary hover:underline font-medium">View all in Explorer →</Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {[
                                { title: "Pune Metropolitan Regional Plan 2041", type: "Policy Document", date: "2023", relevance: "High", loc: "PMRDA Region" },
                                { title: "Urban Sprawl and Agricultural Loss in Western Maharashtra", type: "Research Paper", date: "2024", relevance: "High", loc: "Pune District" },
                                { title: "LULC Change Detection 2015-2025", type: "GIS Dataset", date: "2025", relevance: "High", loc: "Mulshi Taluka" },
                                { title: "Infrastructure Corridor Impact Assessment", type: "Analysis Report", date: "2025", relevance: "Medium", loc: "Ring Road Alignment" }
                              ].map((doc, i) => (
                                <div key={i} className="bg-white p-3 rounded-lg border border-accent hover:border-primary transition-colors cursor-pointer shadow-sm">
                                  <div className="flex justify-between text-[10px] mb-1.5 uppercase tracking-wide">
                                    <span className="font-semibold text-primary">{doc.type}</span>
                                    <span className="text-text-secondary">{doc.date}</span>
                                  </div>
                                  <h3 className="font-medium text-foreground text-sm mb-2 line-clamp-2">{doc.title}</h3>
                                  <div className="flex justify-between text-xs text-text-secondary">
                                    <span>📍 {doc.loc}</span>
                                    <span className="font-medium">Relevance: {doc.relevance}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* Synthesis */}
                          <section className="bg-white p-6 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-lg font-bold">AI Synthesis</div>
                            
                            <h2 className="text-lg font-bold text-primary mb-5">BhooNeeti Synthesis</h2>
                            
                            <div className="space-y-5">
                              <div>
                                <h3 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                  Key Finding
                                </h3>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                  Agricultural land conversion around Pune is primarily driven by speculative land acquisition along proposed infrastructure corridors (notably the Ring Road) and the expansion of secondary IT hubs into peri-urban areas like Mulshi and Maval.
                                </p>
                              </div>

                              <div>
                                <h3 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                  Supporting Evidence
                                </h3>
                                <ul className="list-disc pl-5 text-sm text-text-secondary space-y-1.5">
                                  <li>The <span className="font-medium text-foreground">Pune Metropolitan Regional Plan 2041</span> indicates a 15% planned reduction in agricultural zoning to accommodate urban expansion.</li>
                                  <li>Recent <span className="font-medium text-foreground">LULC Change Detection (2015-2025)</span> shows a direct correlation between highway proximity and conversion rates, with a 22% loss of arable land within 5km of new corridors.</li>
                                </ul>
                              </div>

                              <div>
                                <h3 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                  Spatial Context
                                </h3>
                                <p className="text-text-secondary text-sm">
                                  The highest intensity of conversion is localized in the western quadrant (Mulshi/Hinjewadi axis) and the northern corridor (Chakan). <Link href="/gis#change" className="text-primary font-medium hover:underline">View spatial distribution map →</Link>
                                </p>
                              </div>

                              <div>
                                <h3 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                  Policy Relevance
                                </h3>
                                <p className="text-text-secondary text-sm">
                                  Current policies lack strict transfer-of-development-rights (TDR) enforcement in these specific eco-sensitive zones. This baseline trend suggests an urgent need for controlled development scenarios. <Link href="/policy" className="text-primary font-medium hover:underline">Open Policy Studio for simulations →</Link>
                                </p>
                              </div>

                              <div className="pt-4 border-t border-accent mt-5">
                                <h3 className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2.5">Sources Cited</h3>
                                <div className="flex gap-2 flex-wrap text-xs">
                                  <span className="bg-background px-2 py-1 rounded border border-accent">Pune Regional Plan 2041 (Govt, 2023)</span>
                                  <span className="bg-background px-2 py-1 rounded border border-accent">LULC Change Mulshi (GIS, 2025)</span>
                                  <span className="bg-background px-2 py-1 rounded border border-accent">Urban Sprawl & Ag. Loss (Research, 2024)</span>
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom Composer */}
            <div className="bg-background/95 backdrop-blur border-t border-accent/50 p-4 shrink-0 transition-all duration-500 ease-in-out">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSearch} className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-accent">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="flex-1 p-3 border-none rounded-lg focus:outline-none focus:ring-0 text-foreground bg-transparent"
                  />
                  <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <span>Ask</span>
                    <span>➤</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
