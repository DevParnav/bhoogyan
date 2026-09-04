"use client";

import { useState } from 'react';
import Header from '@/components/Header';

export default function PolicyStudio() {
  const stages = ["Problem", "Baseline", "Scenario", "Simulation", "Impact"];
  const [currentStage, setCurrentStage] = useState(0);

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col h-full">
      <Header 
        breadcrumbs={[{ label: 'Policy Studio' }]}
        title="Policy Studio"
        subtitle="Design scenarios, run predictive simulations, and evaluate spatial impacts."
      />

      {/* Horizontal Stepper */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm mb-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-max px-4">
          {stages.map((stage, index) => (
            <div key={stage} className="flex items-center">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => setCurrentStage(index)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  index === currentStage ? 'bg-policy text-white ring-4 ring-primary/20' : 
                  index < currentStage ? 'bg-policy/20 text-policy' : 
                  'bg-muted border border-border text-text-secondary'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-3 text-sm font-medium transition-colors ${
                  index === currentStage ? 'text-policy' : 'text-text-secondary'
                }`}>
                  {stage}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div className={`w-12 md:w-24 h-px mx-4 transition-colors ${
                  index < currentStage ? 'bg-policy' : 'bg-border'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stage Content */}
      <div className="flex-1 bg-surface p-8 rounded-xl border border-border shadow-sm flex flex-col min-h-[400px]">
        
        <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
          <h2 className="text-xl font-bold text-foreground">Stage {currentStage + 1}: {stages[currentStage]}</h2>
          <span className="text-xs bg-muted border border-border text-text-secondary px-2 py-1 rounded">Interactive Module</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 bg-muted rounded-full border border-border flex items-center justify-center text-2xl mb-6">
             {currentStage === 0 && '🎯'}
             {currentStage === 1 && '📊'}
             {currentStage === 2 && '⚙️'}
             {currentStage === 3 && '🔄'}
             {currentStage === 4 && '📈'}
           </div>
           <h3 className="text-lg font-medium text-foreground mb-3">Configure {stages[currentStage]}</h3>
           <p className="text-sm text-text-secondary max-w-md mb-8">
             This interface guides the policymaker through defining assumptions, connecting evidence, and running the XGBoost spatial models to project outcomes.
           </p>
           
           <div className="flex gap-4">
             <button 
               onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
               disabled={currentStage === 0}
               className="px-6 py-2 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-muted disabled:opacity-50"
             >
               Previous
             </button>
             <button 
               onClick={() => setCurrentStage(Math.min(stages.length - 1, currentStage + 1))}
               disabled={currentStage === stages.length - 1}
               className="px-6 py-2 bg-policy text-white rounded-lg text-sm font-medium hover:bg-policy/90 disabled:opacity-50"
             >
               Next Stage
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
