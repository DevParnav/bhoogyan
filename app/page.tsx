import Link from 'next/link';
import DashboardMapWrapper from '@/components/DashboardMapWrapper';

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="bg-surface rounded-xl p-8 border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand mb-2">Evidence-backed land intelligence</h1>
          <p className="text-text-secondary max-w-2xl">
            Connect land evidence, research, geospatial intelligence and policy innovation in one workflow.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/gis" className="bg-surface border border-gis/30 text-gis px-4 py-2 rounded-lg font-medium hover:border-gis hover:bg-gis-light transition-colors">
            Explore Land Intelligence
          </Link>
          <Link href="/bhooneeti" className="bg-ai text-white px-4 py-2 rounded-lg font-medium hover:bg-ai-dark transition-colors">
            Ask BhooNeeti
          </Link>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key Indicators */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface p-5 rounded-xl border border-evidence/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-evidence"></div>
              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Total Evidence</h3>
              <p className="text-2xl font-bold text-brand">195</p>
            </div>
            <div className="bg-surface p-5 rounded-xl border border-brand/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Active Projects</h3>
              <p className="text-2xl font-bold text-brand">4</p>
            </div>
            <div className="bg-surface p-5 rounded-xl border border-gis/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gis"></div>
              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Geospatial Alerts</h3>
              <p className="text-2xl font-bold text-brand">14</p>
            </div>
          </div>

          {/* Land Intelligence Map Preview */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gis"></div>
                <h3 className="font-semibold text-foreground">Land Intelligence Overview</h3>
              </div>
              <Link href="/gis" className="text-xs text-gis font-medium hover:underline">Open Full Map →</Link>
            </div>
            <div className="flex-1 rounded-lg relative flex items-center justify-center border border-border overflow-hidden">
              <DashboardMapWrapper />
            </div>
          </div>

          {/* Active Research Questions */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Active Research Questions</h3>
              <Link href="/projects" className="text-xs text-brand font-medium hover:underline">View Projects →</Link>
            </div>
            <div className="space-y-3">
              <Link href="/projects" className="block p-4 bg-muted border border-border rounded-lg hover:border-brand transition-colors">
                <h4 className="font-medium text-foreground text-sm">What are the major causes of agricultural land conversion around Pune?</h4>
                <p className="text-xs text-text-secondary mt-1">Project: Pune Land Conversion • 12 Evidence Sources</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* BhooNeeti Insights */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-ai"></div>
            <h3 className="font-semibold text-foreground mb-4">BhooNeeti Insights</h3>
            <div className="p-4 bg-ai-light border border-ai/20 rounded-lg">
              <p className="text-sm text-foreground mb-3">AI synthesis indicates a 22% correlation between Ring Road alignment and agricultural loss in Mulshi.</p>
              <Link href="/bhooneeti" className="text-xs font-medium bg-surface border border-border px-3 py-1.5 rounded hover:border-ai text-ai transition-colors inline-block">
                Follow up question →
              </Link>
            </div>
          </div>

          {/* Policy Scenarios */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-policy"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Active Policy Scenarios</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-muted border border-border rounded-lg">
                <h4 className="font-medium text-foreground text-sm">Controlled Development Buffer</h4>
                <p className="text-xs text-policy-dark mt-1 bg-policy-light px-2 py-0.5 rounded inline-block">Status: Running Simulation</p>
              </div>
              <div className="p-3 bg-muted border border-border rounded-lg">
                <h4 className="font-medium text-foreground text-sm">Increased TDR Enforcement</h4>
                <p className="text-xs text-policy-dark mt-1 bg-policy-light px-2 py-0.5 rounded inline-block">Status: Reviewing Impact</p>
              </div>
            </div>
            <Link href="/policy" className="block w-full text-center mt-4 text-xs font-medium text-policy hover:underline">
              Open Policy Studio
            </Link>
          </div>

          {/* Recent Analyses */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Recent Analyses</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-foreground">LULC Change (2015-2025)</span>
                <span className="text-xs text-text-secondary">2d ago</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-foreground">Land Suitability: Maval</span>
                <span className="text-xs text-text-secondary">5d ago</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
