import Link from 'next/link';
import DashboardMapWrapper from '@/components/DashboardMapWrapper';

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl p-8 border border-accent shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Evidence-backed land intelligence</h1>
          <p className="text-text-secondary max-w-2xl">
            Connect land evidence, research, geospatial intelligence and policy innovation in one workflow.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/gis" className="bg-background border border-accent text-foreground px-4 py-2 rounded-lg font-medium hover:border-primary transition-colors">
            Explore Land Intelligence
          </Link>
          <Link href="/bhooneeti" className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
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
            <div className="bg-white p-5 rounded-xl border border-accent shadow-sm">
              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Total Evidence</h3>
              <p className="text-2xl font-bold text-foreground">195</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-accent shadow-sm">
              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Active Projects</h3>
              <p className="text-2xl font-bold text-foreground">4</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-accent shadow-sm">
              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Geospatial Alerts</h3>
              <p className="text-2xl font-bold text-foreground">14</p>
            </div>
          </div>

          {/* Land Intelligence Map Preview */}
          <div className="bg-white p-6 rounded-xl border border-accent shadow-sm flex flex-col h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Land Intelligence Overview</h3>
              <Link href="/gis" className="text-xs text-primary font-medium hover:underline">Open Full Map →</Link>
            </div>
            <div className="flex-1 rounded-lg relative flex items-center justify-center border border-accent overflow-hidden">
              <DashboardMapWrapper />
            </div>
          </div>

          {/* Active Research Questions */}
          <div className="bg-white p-6 rounded-xl border border-accent shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Active Research Questions</h3>
              <Link href="/projects" className="text-xs text-primary font-medium hover:underline">View Projects →</Link>
            </div>
            <div className="space-y-3">
              <Link href="/projects" className="block p-4 bg-background border border-accent rounded-lg hover:border-primary transition-colors">
                <h4 className="font-medium text-foreground text-sm">What are the major causes of agricultural land conversion around Pune?</h4>
                <p className="text-xs text-text-secondary mt-1">Project: Pune Land Conversion • 12 Evidence Sources</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* BhooNeeti Insights */}
          <div className="bg-white p-6 rounded-xl border border-accent shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">BhooNeeti Insights</h3>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-foreground mb-3">AI synthesis indicates a 22% correlation between Ring Road alignment and agricultural loss in Mulshi.</p>
              <Link href="/bhooneeti" className="text-xs font-medium bg-white border border-accent px-3 py-1.5 rounded hover:border-primary transition-colors inline-block text-foreground">
                Follow up question →
              </Link>
            </div>
          </div>

          {/* Policy Scenarios */}
          <div className="bg-white p-6 rounded-xl border border-accent shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Active Policy Scenarios</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-background border border-accent rounded-lg">
                <h4 className="font-medium text-foreground text-sm">Controlled Development Buffer</h4>
                <p className="text-xs text-text-secondary mt-1">Status: Running Simulation</p>
              </div>
              <div className="p-3 bg-background border border-accent rounded-lg">
                <h4 className="font-medium text-foreground text-sm">Increased TDR Enforcement</h4>
                <p className="text-xs text-text-secondary mt-1">Status: Reviewing Impact</p>
              </div>
            </div>
            <Link href="/policy" className="block w-full text-center mt-4 text-xs font-medium text-primary hover:underline">
              Open Policy Studio
            </Link>
          </div>

          {/* Recent Analyses */}
          <div className="bg-white p-6 rounded-xl border border-accent shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Recent Analyses</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center border-b border-accent pb-2">
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
