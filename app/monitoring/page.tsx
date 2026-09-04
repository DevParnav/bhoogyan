"use client";

import { useState } from 'react';
import Header from '@/components/Header';

type Tab = 'overview' | 'indicators' | 'outcomes' | 'alerts' | 'evaluation';

export default function Monitoring() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab, label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'indicators', label: 'Indicators' },
    { id: 'outcomes', label: 'Policy Outcomes' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'evaluation', label: 'Evaluation' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col h-full">
      <Header 
        breadcrumbs={[{ label: 'Monitoring' }]}
        title="Monitoring & Evaluation"
        subtitle="Track indicators, policy outcomes, and generate new evidence."
      />

      {/* Tabs */}
      <div className="border-b border-accent mb-6 overflow-x-auto">
        <nav className="flex space-x-6 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-foreground hover:border-accent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-accent shadow-sm">
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Ag. Land Conversion Rate</h3>
                <p className="text-2xl font-bold text-primary">+4.2%</p>
                <p className="text-xs text-text-secondary mt-1">vs previous year</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-accent shadow-sm">
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">TDR Uptake Target</h3>
                <p className="text-2xl font-bold text-foreground">62%</p>
                <p className="text-xs text-text-secondary mt-1">Goal: 75% by 2026</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-accent shadow-sm">
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Active Spatial Alerts</h3>
                <p className="text-2xl font-bold text-foreground">14</p>
                <p className="text-xs text-text-secondary mt-1">Requires review</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-accent shadow-sm">
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Policies Monitored</h3>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-xs text-text-secondary mt-1">Across 3 domains</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-accent shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-foreground">Recent Policy Outcomes</h3>
                  <button onClick={() => setActiveTab('outcomes')} className="text-xs text-primary hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-background border border-accent rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-foreground text-sm">Ring Road Buffer Zone Conservation</span>
                      <span className="text-xs font-semibold border border-primary text-primary px-2 py-0.5 rounded">On Track</span>
                    </div>
                    <div className="w-full bg-accent/30 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-accent shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-foreground">Geospatial Alerts</h3>
                  <button onClick={() => setActiveTab('alerts')} className="text-xs text-primary hover:underline">View All</button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-background border border-accent rounded flex justify-between items-center">
                    <div>
                      <span className="font-medium text-foreground">Unclassified Encroachment</span>
                      <p className="text-xs text-text-secondary mt-0.5">Maval Riparian Zone</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-accent/50 text-foreground border border-accent rounded">Review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <div className="bg-white rounded-xl border border-accent shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
             <div className="text-4xl mb-4">📊</div>
             <h2 className="text-xl font-bold text-foreground mb-2">{tabs.find(t => t.id === activeTab)?.label} Dashboard</h2>
             <p className="text-text-secondary max-w-md">
               Detailed analytics and reporting for {tabs.find(t => t.id === activeTab)?.label?.toLowerCase()} tracking.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
