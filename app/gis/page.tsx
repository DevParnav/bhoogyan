"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import { BhuvanLulcResponse } from '../api/services/bhuvanLulcAoiWiseService';

// Dynamically import MapComponent to prevent SSR issues with Leaflet's window dependency
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-accent/20 animate-pulse flex items-center justify-center text-text-secondary font-medium">Loading GIS Map...</div>
});

type Tab = 'overview' | 'classification' | 'change' | 'prediction' | 'risk' | 'suitability';

export default function LandIntelligence() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedAoi, setSelectedAoi] = useState<any>(null);
  
  // Classification State
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [classificationError, setClassificationError] = useState<string | null>(null);
  const [modelType, setModelType] = useState('bhuvan_api');
  
  // Sentinel-2 Prep State (Dev Only)
  const [isPrepLoading, setIsPrepLoading] = useState(false);
  const [prepResult, setPrepResult] = useState<any>(null);
  const [prepError, setPrepError] = useState<string | null>(null);
  
  const [selectedScene, setSelectedScene] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadResult, setDownloadResult] = useState<any>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  
  const [isPreprocessing, setIsPreprocessing] = useState(false);
  const [preprocessResult, setPreprocessResult] = useState<any>(null);
  const [preprocessError, setPreprocessError] = useState<string | null>(null);
  
  const [s2DateFrom, setS2DateFrom] = useState('2026-08-01');
  const [s2DateTo, setS2DateTo] = useState('2026-08-31');
  const [s2MaxCloud, setS2MaxCloud] = useState(20);

  // Change Detection State (Dual Scene)
  const [cdBeforeDateFrom, setCdBeforeDateFrom] = useState('2025-05-01');
  const [cdBeforeDateTo, setCdBeforeDateTo] = useState('2025-05-31');
  const [cdBeforeMaxCloud, setCdBeforeMaxCloud] = useState(20);
  const [isCdBeforePrepLoading, setIsCdBeforePrepLoading] = useState(false);
  const [cdBeforePrepResult, setCdBeforePrepResult] = useState<any>(null);
  const [cdBeforeSelectedScene, setCdBeforeSelectedScene] = useState<any>(null);

  const [cdAfterDateFrom, setCdAfterDateFrom] = useState('2026-05-01');
  const [cdAfterDateTo, setCdAfterDateTo] = useState('2026-05-31');
  const [cdAfterMaxCloud, setCdAfterMaxCloud] = useState(20);
  const [isCdAfterPrepLoading, setIsCdAfterPrepLoading] = useState(false);
  const [cdAfterPrepResult, setCdAfterPrepResult] = useState<any>(null);
  const [cdAfterSelectedScene, setCdAfterSelectedScene] = useState<any>(null);

  const [cdBeforeSearchError, setCdBeforeSearchError] = useState<string | null>(null);
  const [cdAfterSearchError, setCdAfterSearchError] = useState<string | null>(null);

  const [isCdDownloading, setIsCdDownloading] = useState(false);
  const [cdDownloadError, setCdDownloadError] = useState<string | null>(null);
  
  const [isCdValidating, setIsCdValidating] = useState(false);
  const [cdValidationResult, setCdValidationResult] = useState<any>(null);
  const [cdValidationError, setCdValidationError] = useState<string | null>(null);

  const [cdBeforeFilePath, setCdBeforeFilePath] = useState<string | null>(null);
  const [cdAfterFilePath, setCdAfterFilePath] = useState<string | null>(null);

  const [isCdDetecting, setIsCdDetecting] = useState(false);
  const [cdDetectResult, setCdDetectResult] = useState<any>(null);
  const [cdDetectError, setCdDetectError] = useState<string | null>(null);

  const [changeThreshold, setChangeThreshold] = useState<number>(0.15);
  const [isClassifyingChange, setIsClassifyingChange] = useState(false);
  const [changeClassifyResult, setChangeClassifyResult] = useState<any>(null);
  const [changeClassifyError, setChangeClassifyError] = useState<string | null>(null);
  
  const [isFullScreenMapOpen, setIsFullScreenMapOpen] = useState(false);

  // New UI States
  const [panelMode, setPanelMode] = useState<'compact' | 'standard' | 'wide'>('standard');
  const [openSections, setOpenSections] = useState({
    aoi: true,
    scenes: true,
    analysis: true,
    results: true
  });
  
  useEffect(() => {
    if (isFullScreenMapOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreenMapOpen) {
        setIsFullScreenMapOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Don't auto-restore on unmount unless we know it's unmounting completely, 
      // but safe to do here since it's the main page
      if (isFullScreenMapOpen) document.body.style.overflow = 'auto';
    };
  }, [isFullScreenMapOpen]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const tabs: { id: Tab, label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'classification', label: 'Classification' },
    { id: 'change', label: 'Change Detection' },
    { id: 'prediction', label: 'Prediction' },
    { id: 'risk', label: 'Risk & Anomaly' },
    { id: 'suitability', label: 'Suitability' },
  ];

  const handleAoiCreated = (geoJson: any) => {
    setSelectedAoi(geoJson);
    setClassificationResult(null); // Reset results when drawing a new AOI
    setClassificationError(null);
    setPrepResult(null);
    setPrepError(null);
    setSelectedScene(null);
    setDownloadResult(null);
    setDownloadError(null);
    setPreprocessResult(null);
    setPreprocessError(null);
    
    // Reset CD State
    setCdBeforePrepResult(null);
    setCdBeforeSelectedScene(null);
    setCdAfterPrepResult(null);
    setCdAfterSelectedScene(null);
    setCdDownloadError(null);
    setCdValidationResult(null);
    setCdValidationError(null);
    setCdBeforeFilePath(null);
    setCdAfterFilePath(null);
    setCdDetectResult(null);
    setCdDetectError(null);
    setChangeClassifyResult(null);
    setChangeClassifyError(null);
  };

  const handleAoiCleared = () => {
    setSelectedAoi(null);
    setClassificationResult(null);
    setClassificationError(null);
    setPrepResult(null);
    setPrepError(null);
    setSelectedScene(null);
    setDownloadResult(null);
    setDownloadError(null);
    setPreprocessResult(null);
    setPreprocessError(null);
    
    // Reset CD State
    setCdBeforePrepResult(null);
    setCdBeforeSelectedScene(null);
    setCdAfterPrepResult(null);
    setCdAfterSelectedScene(null);
    setCdDownloadError(null);
    setCdValidationResult(null);
    setCdValidationError(null);
    setCdBeforeFilePath(null);
    setCdAfterFilePath(null);
    setCdDetectResult(null);
    setCdDetectError(null);
    setChangeClassifyResult(null);
    setChangeClassifyError(null);
    setCdBeforeSearchError(null);
    setCdAfterSearchError(null);
  };

  const runClassification = async () => {
    // If testing the local model via unet_test, we ignore the AOI and use the TIFF
    if (!selectedAoi && modelType !== 'unet_test') {
      setClassificationError("Please select an area on the map first.");
      return;
    }
    
    setIsClassifying(true);
    setClassificationError(null);
    setClassificationResult(null);
    
    try {
      if (modelType === 'unet_test') {
        // Dev test data fetch
        const tiffResponse = await fetch('/sentinel2_test_512.tif').catch(() => null);
        if (!tiffResponse || !tiffResponse.ok) {
          throw new Error("Could not load test TIFF from public folder. This is a DEV ONLY feature and the test file is not deployed to production.");
        }
        const tiffBlob = await tiffResponse.blob();

        const formData = new FormData();
        formData.append('file', tiffBlob, 'sentinel2_test_512.tif');

        const response = await fetch('/api/gis/classification', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Model inference failed.');
        }

        setClassificationResult({
          source: 'Hugging Face U-Net (Test TIFF)',
          type: 'unet',
          raw_response: data
        });

      } else {
        const response = await fetch('/api/gis/bhuvan/lulc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedAoi),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Bhuvan LULC analysis could not be completed.');
        }

        setClassificationResult({
          source: 'Bhuvan',
          type: 'bhuvan',
          raw_response: data
        });
      }
    } catch (err: any) {
      setClassificationError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsClassifying(false);
    }
  };

  const prepareSentinel2Data = async () => {
    if (!selectedAoi) return;
    
    setIsPrepLoading(true);
    setPrepError(null);
    setPrepResult(null);
    setSelectedScene(null);
    setDownloadResult(null);
    setDownloadError(null);
    setPreprocessResult(null);
    setPreprocessError(null);
    
    try {
      const response = await fetch('/api/gis/sentinel2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aoi: selectedAoi,
          options: {
            dateFrom: s2DateFrom,
            dateTo: s2DateTo,
            maxCloudCoverage: s2MaxCloud
          }
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to prepare Sentinel-2 data.');
      }
      
      setPrepResult(data);
    } catch (err: any) {
      setPrepError(err.message || 'An error occurred during preparation.');
    } finally {
      setIsPrepLoading(false);
    }
  };

  const downloadSentinel2Data = async () => {
    if (!selectedAoi || !selectedScene) return;

    setIsDownloading(true);
    setDownloadError(null);
    setDownloadResult(null);
    setPreprocessResult(null);
    setPreprocessError(null);

    try {
      const response = await fetch('/api/gis/sentinel2/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aoi: selectedAoi, scene: selectedScene }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to download Sentinel-2 data.');
      }

      setDownloadResult(data);
    } catch (err: any) {
      setDownloadError(err.message || 'An error occurred during download.');
    } finally {
      setIsDownloading(false);
    }
  };

  const prepareUnetInput = async () => {
    if (!downloadResult?.file) return;
    
    setIsPreprocessing(true);
    setPreprocessError(null);
    setPreprocessResult(null);
    
    try {
      const response = await fetch('/api/gis/classification/preprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputFile: downloadResult.file }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to preprocess GeoTIFF.');
      }
      
      setPreprocessResult(data);
    } catch (err: any) {
      setPreprocessError(err.message || 'An error occurred during preprocessing.');
    } finally {
      setIsPreprocessing(false);
    }
  };

  const runRealClassification = async () => {
    if (!preprocessResult?.outputFile) return;

    setIsClassifying(true);
    setClassificationError(null);
    setClassificationResult(null);

    try {
      const response = await fetch('/api/gis/classification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: preprocessResult.outputFile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to classify land cover.');
      }

      // Add a source label to differentiate in the UI
      data.source = 'Real Sentinel-2 Inference';
      setClassificationResult(data);
    } catch (err: any) {
      setClassificationError(err.message || 'An error occurred during classification.');
    } finally {
      setIsClassifying(false);
    }
  };

  const searchScenes = async (type: 'before' | 'after') => {
    const isBefore = type === 'before';
    const setError = isBefore ? setCdBeforeSearchError : setCdAfterSearchError;

    if (!selectedAoi) {
      setError("Please select an AOI on the map first.");
      return;
    }
    
    const setLoading = isBefore ? setIsCdBeforePrepLoading : setIsCdAfterPrepLoading;
    const setResult = isBefore ? setCdBeforePrepResult : setCdAfterPrepResult;
    const setScene = isBefore ? setCdBeforeSelectedScene : setCdAfterSelectedScene;
    
    setLoading(true);
    setResult(null);
    setScene(null);
    setError(null);
    
    try {
      const response = await fetch('/api/gis/sentinel2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aoi: selectedAoi,
          options: {
            dateFrom: isBefore ? cdBeforeDateFrom : cdAfterDateFrom,
            dateTo: isBefore ? cdBeforeDateTo : cdAfterDateTo,
            maxCloudCoverage: isBefore ? cdBeforeMaxCloud : cdAfterMaxCloud
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search Sentinel-2 scenes.');
      }
      
      setResult(data);
    } catch (err: any) {
      console.error("Search Scenes Error:", err);
      setError(err.message || 'An error occurred during search.');
    } finally {
      setLoading(false);
    }
  };

  const prepareChangeDetectionData = async () => {
    if (!selectedAoi || !cdBeforeSelectedScene || !cdAfterSelectedScene) return;

    if (cdBeforeSelectedScene.id === cdAfterSelectedScene.id) {
      setCdDownloadError("BEFORE and AFTER scenes cannot be the exact same scene.");
      return;
    }

    setIsCdDownloading(true);
    setCdDownloadError(null);
    setCdValidationResult(null);
    setCdValidationError(null);

    try {
      // 1. Download Both in Parallel
      const [beforeRes, afterRes] = await Promise.all([
        fetch('/api/gis/sentinel2/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aoi: selectedAoi, scene: cdBeforeSelectedScene }),
        }),
        fetch('/api/gis/sentinel2/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aoi: selectedAoi, scene: cdAfterSelectedScene }),
        })
      ]);

      const beforeData = await beforeRes.json();
      const afterData = await afterRes.json();

      if (!beforeRes.ok) throw new Error(beforeData.error || 'Failed to download BEFORE scene.');
      if (!afterRes.ok) throw new Error(afterData.error || 'Failed to download AFTER scene.');

      setCdBeforeFilePath(beforeData.file);
      setCdAfterFilePath(afterData.file);

      // 2. Validate Alignment
      setIsCdValidating(true);
      const valRes = await fetch('/api/gis/change/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          beforeFilePath: beforeData.file, 
          afterFilePath: afterData.file 
        }),
      });

      const valData = await valRes.json();
      
      if (!valRes.ok) {
        throw new Error(valData.error || 'Raster validation failed.');
      }

      setCdValidationResult(valData);
    } catch (err: any) {
      setCdDownloadError(err.message || 'Failed to prepare Change Detection data.');
    } finally {
      setIsCdDownloading(false);
      setIsCdValidating(false);
    }
  };

  const calculateNdviChange = async () => {
    if (!cdBeforeFilePath || !cdAfterFilePath) return;

    setIsCdDetecting(true);
    setCdDetectError(null);
    setCdDetectResult(null);

    try {
      const response = await fetch('/api/gis/change/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beforeFilePath: cdBeforeFilePath,
          afterFilePath: cdAfterFilePath,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate NDVI change.');
      }

      setCdDetectResult(data);
    } catch (err: any) {
      setCdDetectError(err.message || 'Error calculating NDVI change.');
    } finally {
      setIsCdDetecting(false);
    }
  };

  const classifyChangeMap = async () => {
    if (!cdDetectResult?.outputPath) return;

    setIsClassifyingChange(true);
    setChangeClassifyError(null);
    setChangeClassifyResult(null);

    try {
      const response = await fetch('/api/gis/change/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ndviChangePath: cdDetectResult.outputPath,
          threshold: changeThreshold,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to classify change.');
      }

      setChangeClassifyResult(data);
    } catch (err: any) {
      setChangeClassifyError(err.message || 'Error classifying change.');
    } finally {
      setIsClassifyingChange(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col h-[calc(100vh-40px)]">
      <div className="flex-shrink-0">
        <Header 
          breadcrumbs={[{ label: 'Land Intelligence' }]}
          title="Land Intelligence"
          subtitle="Explore, analyse and understand land-use dynamics."
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-accent mb-6 flex-shrink-0">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--color-primary)] text-primary'
                  : 'border-transparent text-text-secondary hover:text-foreground hover:border-accent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden pb-4">
        <div className={`grid h-full gap-6 ${
          panelMode === 'compact' ? 'grid-cols-1 lg:grid-cols-4' : 
          panelMode === 'wide' ? 'grid-cols-1 lg:grid-cols-2' : 
          'grid-cols-1 lg:grid-cols-3'
        }`}>
          
          {/* Main Map Container */}
          <div className={`flex flex-col h-full z-0 ${
            panelMode === 'compact' ? 'lg:col-span-3' : 
            panelMode === 'wide' ? 'lg:col-span-1' : 
            'lg:col-span-2'
          }`}>
            <div className="bg-white rounded-xl border border-accent shadow-[0_12px_40px_rgba(91,74,62,0.06)] overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-accent flex justify-between items-center bg-background/50 flex-shrink-0">
                <h3 className="font-semibold text-foreground">Interactive GIS Map</h3>
                {selectedAoi ? (
                  <span className="text-xs bg-secondary text-primary px-2 py-1 rounded font-medium shadow-sm">AOI Selected</span>
                ) : (
                  <span className="text-xs text-text-secondary px-2 py-1">Draw an AOI to begin</span>
                )}
              </div>
              <div className="flex-1 relative bg-background">
                <MapComponent onAoiCreated={handleAoiCreated} onAoiCleared={handleAoiCleared} />
              </div>
            </div>
          </div>

          {/* Side Panels Based on Tab */}
          <div className="h-full overflow-y-auto pr-2 pb-12 space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                <div className="bg-white p-6 rounded-xl border border-accent shadow-[0_12px_40px_rgba(91,74,62,0.06)]">
                  <h3 className="font-semibold text-foreground mb-4">Active Monitoring Zones</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center p-3 bg-background rounded-lg border border-accent/60">
                      <span className="font-medium text-foreground">Mulshi Buffer Zone</span>
                      <span className="text-[10px] uppercase font-bold text-primary bg-secondary px-2 py-1 rounded">Tracking</span>
                    </li>
                    <li className="flex justify-between items-center p-3 bg-background rounded-lg border border-accent/60">
                      <span className="font-medium text-foreground">Maval Riparian</span>
                      <span className="text-[10px] uppercase font-bold text-primary bg-secondary px-2 py-1 rounded">Tracking</span>
                    </li>
                  </ul>
                </div>
              </>
            )}

            {/* CLASSIFICATION TAB */}
            {activeTab === 'classification' && (
              <div className="bg-white p-6 rounded-xl border border-accent shadow-[0_12px_40px_rgba(91,74,62,0.06)] flex flex-col gap-5">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Classification Workspace</h3>
                  <p className="text-[13px] text-text-secondary">
                    Configure parameters and run inference on the selected AOI.
                  </p>
                </div>

                {/* 1. AOI Status */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">1. Area of Interest (AOI)</label>
                  {selectedAoi ? (
                    <div className="flex flex-col gap-2">
                      <div className="p-3 bg-background border border-accent rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-primary flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            AOI Status: Selected
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">Format: GeoJSON {selectedAoi.geometry?.type}</div>
                        </div>
                        <button 
                          onClick={handleAoiCleared}
                          className="text-xs font-semibold text-primary hover:text-white bg-secondary hover:bg-primary px-3 py-1.5 rounded transition-colors shadow-sm"
                        >
                          Clear AOI
                        </button>
                      </div>
                      
                      {/* Debug view */}
                      <details className="text-[10px] text-text-secondary bg-secondary/30 p-2 rounded border border-accent/30 cursor-pointer">
                        <summary className="font-semibold uppercase tracking-widest">AOI GeoJSON Data (Debug)</summary>
                        <pre className="mt-2 overflow-auto max-h-32 text-[9px] bg-white p-2 rounded border border-accent/50">
                          {JSON.stringify(selectedAoi, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <div className="p-4 bg-background border border-accent border-dashed rounded-lg text-center text-[13px] text-text-secondary">
                      <div className="font-medium text-foreground mb-1">AOI Status: No area selected</div>
                      Draw a polygon or rectangle on the map.
                    </div>
                  )}
                </div>

                {/* 2. Data Source */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">2. Data Source</label>
                  <select className="w-full p-2.5 bg-background border border-accent rounded-lg text-sm text-foreground focus:outline-none focus:border-primary">
                    <option value="bhuvan">Bhuvan LULC AOI Wise (Connected)</option>
                    <option value="bhoonidhi" disabled>Bhoonidhi Satellite Data (Not connected yet)</option>
                  </select>
                </div>

                {/* 3. Classification Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">3. Classification Type</label>
                  <select className="w-full p-2.5 bg-background border border-accent rounded-lg text-sm text-foreground focus:outline-none focus:border-primary">
                    <option value="lulc">Land Use / Land Cover (LULC)</option>
                  </select>
                </div>

                {/* 4. Model */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">4. Model</label>
                  <select 
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    className="w-full p-2.5 bg-background border border-accent rounded-lg text-sm text-foreground focus:outline-none focus:border-primary">
                    <option value="bhuvan_api">Bhuvan API (Default)</option>
                    <option value="unet_real">LULC U-Net</option>
                    <option value="unet_test">Developer Test (Test TIFF)</option>
                  </select>
                  {modelType === 'unet_real' && (
                    <div className="text-[10px] font-bold text-primary mt-1 bg-secondary inline-block px-2 py-0.5 rounded shadow-sm">
                      Sentinel-2 AOI Classification
                    </div>
                  )}
                  {modelType === 'unet_test' && (
                    <div className="text-[10px] font-bold text-primary mt-1 bg-secondary inline-block px-2 py-0.5 rounded shadow-sm">
                      Using test Sentinel-2 imagery (AOI ignored)
                    </div>
                  )}
                </div>

                {/* 5. Run Button */}
                {modelType !== 'unet_real' && (
                  <div className="pt-2">
                    <button
                      onClick={runClassification}
                      disabled={(!selectedAoi && modelType !== 'unet_test') || isClassifying}
                      className="w-full py-3 px-4 bg-primary text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                    >
                      {isClassifying ? 'Analyzing...' : 'Run Classification'}
                    </button>
                    
                    {classificationError && (
                      <div className="mt-3 p-3 bg-[#F8DED4]/50 border border-[#F8DED4] text-primary text-xs rounded-lg">
                        {classificationError}
                      </div>
                    )}
                  </div>
                )}
                
                {/* 5B. Real U-Net Workflow: Prepare Sentinel-2 Data */}
                {selectedAoi && modelType === 'unet_real' && (
                  <div className="pt-2 border-t border-accent mt-2">
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-text-secondary uppercase">From</label>
                        <input type="date" value={s2DateFrom} onChange={(e) => setS2DateFrom(e.target.value)} className="w-full text-xs p-1.5 border border-accent rounded" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-text-secondary uppercase">To</label>
                        <input type="date" value={s2DateTo} onChange={(e) => setS2DateTo(e.target.value)} className="w-full text-xs p-1.5 border border-accent rounded" />
                      </div>
                      <div className="w-16">
                        <label className="text-[9px] font-bold text-text-secondary uppercase">Cloud%</label>
                        <input type="number" value={s2MaxCloud} onChange={(e) => setS2MaxCloud(Number(e.target.value))} className="w-full text-xs p-1.5 border border-accent rounded" />
                      </div>
                    </div>
                    
                    <button
                      onClick={prepareSentinel2Data}
                      disabled={isPrepLoading}
                      className="w-full py-2 px-4 bg-secondary text-primary text-sm font-medium rounded-xl hover:bg-primary hover:text-white transition-colors disabled:opacity-50 shadow-sm border border-primary/20"
                    >
                      {isPrepLoading ? 'Searching Copernicus STAC...' : 'Find Sentinel-2 Scenes'}
                    </button>
                    
                    {prepError && (
                      <div className="mt-3 p-3 bg-[#F8DED4]/50 border border-[#F8DED4] text-primary text-xs rounded-lg">
                        {prepError}
                      </div>
                    )}
                    
                    {prepResult && (
                      <div className="mt-3 p-3 bg-background border border-accent rounded-lg text-[11px] text-text-secondary">
                        <div className="font-bold text-primary mb-2 uppercase tracking-widest flex justify-between">
                          <span>{prepResult.provider}</span>
                          <span className="bg-[#F8DED4] px-1.5 rounded text-[9px]">{prepResult.collection}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Sentinel-2 Scenes Found:</span>
                          <span className="font-bold text-foreground">{prepResult.count}</span>
                        </div>
                        
                        {prepResult.scenes && prepResult.scenes.length > 0 && (
                          <div className="mt-2 border border-accent/50 rounded overflow-hidden max-h-48 overflow-y-auto">
                            <table className="w-full text-left text-[10px]">
                              <thead className="bg-secondary/50 uppercase">
                                <tr>
                                  <th className="p-1.5 border-b border-accent/50 font-semibold">Date</th>
                                  <th className="p-1.5 border-b border-accent/50 font-semibold">Cloud</th>
                                  <th className="p-1.5 border-b border-accent/50 font-semibold">Tile</th>
                                  <th className="p-1.5 border-b border-accent/50 font-semibold">Select</th>
                                </tr>
                              </thead>
                              <tbody>
                                {prepResult.scenes.map((scene: any, i: number) => (
                                  <tr key={i} className={`border-b border-accent/20 last:border-0 hover:bg-secondary/30 ${selectedScene?.id === scene.id ? 'bg-secondary' : ''}`}>
                                    <td className="p-1.5 whitespace-nowrap">{new Date(scene.date).toLocaleDateString()}</td>
                                    <td className="p-1.5">{Number(scene.cloudCoverage).toFixed(1)}%</td>
                                    <td className="p-1.5">{scene.tile}</td>
                                    <td className="p-1.5">
                                      <button 
                                        onClick={() => setSelectedScene(scene)}
                                        className="text-[9px] font-bold bg-primary text-white px-2 py-1 rounded hover:opacity-80"
                                      >
                                        Select
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedScene && (
                      <div className="mt-3 p-3 bg-secondary/20 border border-primary/20 rounded-lg">
                        <div className="font-bold text-primary mb-2 text-[11px] uppercase tracking-widest">Selected Scene</div>
                        <div className="text-[11px] text-text-secondary space-y-1 mb-3">
                          <div className="flex justify-between"><span>Scene:</span><span className="font-medium text-foreground">{new Date(selectedScene.date).toLocaleDateString()}</span></div>
                          <div className="flex justify-between"><span>Cloud:</span><span className="font-medium text-foreground">{Number(selectedScene.cloudCoverage).toFixed(2)}%</span></div>
                          <div className="flex justify-between"><span>Tile:</span><span className="font-medium text-foreground">{selectedScene.tile}</span></div>
                        </div>
                        
                        <button
                          onClick={downloadSentinel2Data}
                          disabled={isDownloading}
                          className="w-full py-2 px-4 bg-primary text-white text-[13px] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                        >
                          {isDownloading ? 'Downloading...' : 'Download Sentinel-2 Data'}
                        </button>
                        
                        {downloadError && (
                          <div className="mt-3 p-3 bg-[#F8DED4]/50 border border-[#F8DED4] text-primary text-xs rounded-lg">
                            {downloadError}
                          </div>
                        )}
                        
                        {downloadResult && (
                          <div className="mt-3 p-3 bg-white border border-green-200 rounded-lg text-[10px] text-text-secondary">
                            <div className="font-bold text-green-600 mb-1 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Downloaded Successfully
                            </div>
                            <div className="space-y-1 mt-2 font-mono">
                              <div className="flex justify-between"><span>Width:</span><span className="text-foreground">{downloadResult.metadata.width}px</span></div>
                              <div className="flex justify-between"><span>Height:</span><span className="text-foreground">{downloadResult.metadata.height}px</span></div>
                              <div className="flex justify-between"><span>Resolution:</span><span className="text-foreground">{downloadResult.metadata.resolution}</span></div>
                              <div className="flex justify-between"><span>Bands:</span><span className="text-foreground">{downloadResult.metadata.bands}</span></div>
                              <div className="flex justify-between"><span>Size:</span><span className="text-foreground">{(downloadResult.metadata.fileSize / 1024 / 1024).toFixed(2)} MB</span></div>
                              <div className="mt-2 pt-2 border-t border-accent">
                                <span className="block mb-1 font-sans font-semibold">Band Order:</span>
                                <div className="flex flex-wrap gap-1">
                                  {downloadResult.metadata.bandNames.map((b: string, i: number) => (
                                    <span key={i} className="bg-secondary px-1 py-0.5 rounded text-[9px]">{b}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-green-200">
                              <button
                                onClick={prepareUnetInput}
                                disabled={isPreprocessing}
                                className="w-full py-2 px-4 bg-primary text-white text-[12px] font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                              >
                                {isPreprocessing ? 'Validating 13-band GeoTIFF...' : 'Prepare U-Net Input'}
                              </button>
                            </div>
                            
                            {preprocessError && (
                              <div className="mt-3 p-3 bg-[#F8DED4]/50 border border-[#F8DED4] text-primary text-xs rounded-lg">
                                {preprocessError}
                              </div>
                            )}
                            
                            {preprocessResult && (
                              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-[10px] text-indigo-900 font-mono">
                                <div className="font-bold mb-2 uppercase tracking-widest text-indigo-700">Validated U-Net Input</div>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div>
                                    <div className="text-indigo-400 text-[8px] uppercase">Input</div>
                                    <div className="font-semibold">{preprocessResult.inputBands} bands</div>
                                  </div>
                                  <div>
                                    <div className="text-indigo-400 text-[8px] uppercase">Output</div>
                                    <div className="font-semibold">{preprocessResult.outputChannels} channels (to Server)</div>
                                  </div>
                                  <div>
                                    <div className="text-indigo-400 text-[8px] uppercase">Resolution</div>
                                    <div className="font-semibold">{preprocessResult.resolution}m</div>
                                  </div>
                                  <div>
                                    <div className="text-indigo-400 text-[8px] uppercase">Dimensions</div>
                                    <div className="font-semibold">{preprocessResult.width} × {preprocessResult.height}</div>
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-indigo-200">
                                  <span className="block mb-1 text-indigo-400 text-[8px] uppercase">Indices Computed</span>
                                  <div className="font-semibold tracking-wider">{preprocessResult.indicesComputed}</div>
                                </div>
                              </div>
                            )}
                            
                            {preprocessResult && (
                              <div className="mt-4 pt-3 border-t border-indigo-200">
                                <button
                                  onClick={runRealClassification}
                                  disabled={isClassifying}
                                  className="w-full py-3 px-4 bg-emerald-600 text-white text-[13px] font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-md uppercase tracking-wide flex items-center justify-center gap-2"
                                >
                                  {isClassifying ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                      Running Real Inference...
                                    </>
                                  ) : (
                                    'Run Real Model Inference'
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Results View */}
                {classificationResult && (() => {
                  const raw = classificationResult.raw_response;
                  
                  let statsArray: any[] = [];
                  let totalArea = 0;
                  
                  if (classificationResult.type === 'unet' && raw?.class_stats) {
                    statsArray = Object.entries(raw.class_stats).map(([key, val]: [string, any], idx) => ({
                      name: key.replace(/_/g, ' '),
                      percent: Number(val),
                      area: 0,
                      color: `hsl(${(idx * 137.5) % 360}, 70%, 50%)`
                    }));
                  } else {
                    const extracted = raw?.statistics || raw?.data?.statistics || raw?.classes || raw?.data?.classes || raw?.data || [];
                    if (Array.isArray(extracted)) {
                      statsArray = extracted.map((item: any, idx: number) => ({
                        name: item.class_name || item.className || item.name || item.type || `Class ${idx+1}`,
                        percent: item.percentage || item.percent || item.value || 0,
                        area: item.area_sqkm || item.area || 0,
                        color: item.color || `hsl(${(idx * 137.5) % 360}, 70%, 50%)`
                      }));
                    }
                    totalArea = raw?.area_sqkm || raw?.data?.area_sqkm || raw?.total_area || 0;
                  }

                  const isArray = statsArray.length > 0;
                  const dominant = isArray ? statsArray.reduce((prev: any, current: any) => (prev.percent > current.percent) ? prev : current) : null;

                  return (
                    <div className="mt-2 pt-5 border-t border-accent">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-foreground text-sm">Analysis Results</h4>
                        <span className="text-[10px] uppercase font-bold text-primary bg-[#F8DED4] px-2 py-1 rounded tracking-widest shadow-sm">
                          {classificationResult.source}
                        </span>
                      </div>
                      
                      {isArray ? (
                        <>
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="p-3 bg-background border border-accent/60 rounded-lg">
                              <div className="text-[10px] uppercase font-bold text-text-secondary mb-1">Dominant Cover</div>
                              <div className="text-sm font-semibold text-primary truncate">
                                {dominant ? dominant.name : 'Unknown'}
                              </div>
                            </div>
                            <div className="p-3 bg-background border border-accent/60 rounded-lg">
                              <div className="text-[10px] uppercase font-bold text-text-secondary mb-1">Total Area</div>
                              <div className="text-sm font-semibold text-primary truncate">
                                {totalArea ? `${Number(totalArea).toFixed(1)} sq km` : 'N/A'}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3.5">
                            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">LULC Distribution</div>
                            {statsArray.map((cls: any, idx: number) => (
                              <div key={idx} className="text-[13px]">
                                <div className="flex justify-between mb-1.5">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cls.color }}></span>
                                    <span className="text-text-secondary font-medium">{cls.name}</span>
                                  </div>
                                  <span className="font-semibold text-foreground">{Number(cls.percent).toFixed(1)}%</span>
                                </div>
                                {/* Progress bar visual */}
                                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cls.percent}%`, backgroundColor: cls.color }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {classificationResult.type === 'unet' && raw?.overlay && (
                            <div className="mt-5 border border-accent/60 rounded-xl overflow-hidden shadow-sm bg-background">
                              <div className="px-3 py-2 bg-background border-b border-accent/60 text-[10px] uppercase font-bold text-text-secondary">
                                Model Classification Overlay
                              </div>
                              <img src={`data:image/png;base64,${raw.overlay}`} alt="Classification Overlay" className="w-full h-auto object-contain" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-4 bg-background border border-accent rounded-lg text-[11px] text-text-secondary overflow-auto max-h-60">
                          <p className="font-bold mb-2 text-foreground">API Response Data:</p>
                          <pre>{JSON.stringify(raw, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

                        {/* CHANGE DETECTION TAB */}
            {activeTab === 'change' && (
              <div className="flex flex-col gap-6">
                
                {/* Workspace Header & Controls */}
                <div className="bg-white p-5 rounded-xl border border-accent shadow-[0_12px_40px_rgba(91,74,62,0.06)] shrink-0">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Change Detection Workspace</h3>
                      <p className="text-[13px] text-text-secondary">
                        Select two temporal scenes for pixel-aligned change analysis.
                      </p>
                    </div>
                    
                    {/* Panel Size Control */}
                    <div className="flex bg-background border border-accent rounded-lg p-1">
                      {(['compact', 'standard', 'wide'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setPanelMode(mode)}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                            panelMode === mode 
                              ? 'bg-white text-primary shadow-sm border border-accent/60' 
                              : 'text-text-secondary hover:text-foreground hover:bg-white/50'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="relative pt-2 pb-2">
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-accent/50 -translate-y-1/2 z-0"></div>
                    <div className="relative z-10 flex justify-between">
                      <div className="flex flex-col items-center gap-1.5 bg-white px-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${selectedAoi ? 'border-[#228B22] bg-[#228B22] text-white' : 'border-primary bg-primary text-white'}`}>1</div>
                        <span className={`text-[9px] uppercase font-bold ${selectedAoi ? 'text-[#228B22]' : 'text-primary'}`}>AOI</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 bg-white px-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${(cdBeforeSelectedScene && cdAfterSelectedScene) ? 'border-[#228B22] bg-[#228B22] text-white' : (selectedAoi ? 'border-primary bg-white text-primary' : 'border-accent bg-background text-text-secondary')}`}>2</div>
                        <span className={`text-[9px] uppercase font-bold ${(cdBeforeSelectedScene && cdAfterSelectedScene) ? 'text-[#228B22]' : (selectedAoi ? 'text-primary' : 'text-text-secondary')}`}>Scenes</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 bg-white px-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${cdValidationResult?.success ? 'border-[#228B22] bg-[#228B22] text-white' : ((cdBeforeSelectedScene && cdAfterSelectedScene) ? 'border-primary bg-white text-primary' : 'border-accent bg-background text-text-secondary')}`}>3</div>
                        <span className={`text-[9px] uppercase font-bold ${cdValidationResult?.success ? 'text-[#228B22]' : ((cdBeforeSelectedScene && cdAfterSelectedScene) ? 'text-primary' : 'text-text-secondary')}`}>Validate</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 bg-white px-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${cdDetectResult?.success ? 'border-[#228B22] bg-[#228B22] text-white' : (cdValidationResult?.success ? 'border-primary bg-white text-primary' : 'border-accent bg-background text-text-secondary')}`}>4</div>
                        <span className={`text-[9px] uppercase font-bold ${cdDetectResult?.success ? 'text-[#228B22]' : (cdValidationResult?.success ? 'text-primary' : 'text-text-secondary')}`}>Results</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. AOI Selection Accordion */}
                <div className="bg-white rounded-xl border border-accent shadow-[0_12px_40px_rgba(91,74,62,0.06)] overflow-hidden shrink-0">
                  <button 
                    onClick={() => toggleSection('aoi')}
                    className="w-full flex justify-between items-center p-4 bg-background/30 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">1. Area of Interest</span>
                      {selectedAoi && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                    </div>
                    <span className="text-text-secondary font-mono text-[10px]">{openSections.aoi ? '▼' : '▶'}</span>
                  </button>
                  
                  {openSections.aoi && (
                    <div className="p-5 border-t border-accent/50 bg-white">
                      {selectedAoi ? (
                        <div className="flex flex-col gap-2">
                          <div className="p-4 bg-background border border-accent rounded-xl flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-primary flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                AOI Status: Selected
                              </div>
                              <div className="text-xs text-text-secondary mt-1">Format: GeoJSON {selectedAoi.geometry?.type}</div>
                            </div>
                            <button 
                              onClick={handleAoiCleared}
                              className="text-[11px] font-bold text-primary hover:text-white bg-secondary hover:bg-primary px-4 py-2 rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                            >
                              Clear AOI
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 bg-background border border-accent border-dashed rounded-xl text-center text-[13px] text-text-secondary">
                          <div className="font-semibold text-foreground mb-2">AOI Status: No area selected</div>
                          Draw a polygon or rectangle on the interactive map to begin.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2 & 3. Scene Selection Accordions */}
                {selectedAoi && (
                  <div className="bg-white rounded-xl border border-accent shadow-[0_12px_40px_rgba(91,74,62,0.06)] overflow-hidden shrink-0">
                    <button 
                      onClick={() => toggleSection('scenes')}
                      className="w-full flex justify-between items-center p-4 bg-background/30 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">2. Temporal Scenes</span>
                        {(cdBeforeSelectedScene || cdAfterSelectedScene) && <span className="text-[9px] bg-secondary text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">{[cdBeforeSelectedScene, cdAfterSelectedScene].filter(Boolean).length}/2 Selected</span>}
                      </div>
                      <span className="text-text-secondary font-mono text-[10px]">{openSections.scenes ? '▼' : '▶'}</span>
                    </button>
                    
                    {openSections.scenes && (
                      <div className="p-5 border-t border-accent/50 space-y-8 bg-white">
                        
                        <div className="p-3 bg-[#faf7f5] border border-accent/60 rounded-lg text-[11px] text-[#8a7a6b] italic">
                          <span className="font-bold not-italic">💡 Tip:</span> For accurate temporal comparison, prefer scenes with lower cloud coverage and similar seasonal acquisition conditions.
                        </div>

                        {/* BEFORE Scene */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                              T1 (Before Scene)
                              {cdBeforeSelectedScene && <span className="w-2.5 h-2.5 rounded-full bg-[#228B22]"></span>}
                            </label>
                          </div>
                          
                          {!cdBeforeSelectedScene ? (
                            <div className="p-5 border border-accent rounded-xl bg-background/50">
                              <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">From Date</label>
                                  <input type="date" value={cdBeforeDateFrom} onChange={(e) => setCdBeforeDateFrom(e.target.value)} className="w-full text-[13px] p-2 border border-accent rounded-lg" />
                                </div>
                                <div className="flex-1">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">To Date</label>
                                  <input type="date" value={cdBeforeDateTo} onChange={(e) => setCdBeforeDateTo(e.target.value)} className="w-full text-[13px] p-2 border border-accent rounded-lg" />
                                </div>
                                <div className="w-24">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">Max Cloud%</label>
                                  <input type="number" value={cdBeforeMaxCloud} onChange={(e) => setCdBeforeMaxCloud(Number(e.target.value))} className="w-full text-[13px] p-2 border border-accent rounded-lg" />
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => searchScenes('before')} 
                                disabled={isCdBeforePrepLoading}
                                className="w-full py-2.5 px-4 bg-white border border-accent text-primary text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#faf7f5] transition-colors disabled:opacity-50 shadow-sm"
                              >
                                {isCdBeforePrepLoading ? 'Searching Copernicus STAC...' : 'Search T1 Scenes'}
                              </button>

                              {cdBeforeSearchError && (
                                <div className="mt-3 p-3 bg-[#F8DED4]/50 border border-[#F8DED4] text-primary text-[11px] rounded-lg font-medium">
                                  {cdBeforeSearchError}
                                </div>
                              )}
                              
                              {cdBeforePrepResult && cdBeforePrepResult.scenes && cdBeforePrepResult.scenes.length > 0 && (
                                <div className="mt-4 border border-accent rounded-lg overflow-hidden bg-white shadow-sm">
                                  <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-[#faf7f5] sticky top-0 border-b border-accent z-10">
                                        <tr>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Acquisition Date</th>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Cloud</th>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Tile</th>
                                          <th className="p-3 text-right"></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {cdBeforePrepResult.scenes.map((scene: any) => (
                                          <tr key={scene.id} className="border-b border-accent/30 hover:bg-[#faf7f5]">
                                            <td className="p-3 font-medium">{new Date(scene.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                            <td className="p-3">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${scene.cloudCoverage < 5 ? 'bg-green-100 text-green-700' : scene.cloudCoverage < 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {Number(scene.cloudCoverage).toFixed(1)}%
                                              </span>
                                            </td>
                                            <td className="p-3 text-text-secondary font-mono">{scene.tile}</td>
                                            <td className="p-3 text-right">
                                              <button 
                                                onClick={() => {
                                                  setCdBeforeSelectedScene(scene);
                                                  if (cdAfterSelectedScene) {
                                                    setOpenSections(prev => ({ ...prev, scenes: false, analysis: true }));
                                                  }
                                                }}
                                                className="text-[10px] bg-secondary text-primary px-3 py-1.5 rounded font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-colors"
                                              >
                                                Select
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-[#faf7f5] p-5 rounded-xl border border-[#e2d5c8] shadow-sm">
                              <div className="flex justify-between items-start mb-4 border-b border-[#e2d5c8]/60 pb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] uppercase font-bold text-[#8a7a6b] tracking-widest">✓ T1 Scene Selected</span>
                                </div>
                                <button onClick={() => setCdBeforeSelectedScene(null)} className="text-[10px] font-bold text-[#8a7a6b] hover:text-red-500 uppercase tracking-wider border border-transparent hover:border-red-200 px-2 py-1 rounded transition-colors">Change</button>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-[13px]">
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-text-secondary mb-1 tracking-wider">Date</span>
                                  <span className="font-semibold text-primary">{new Date(cdBeforeSelectedScene.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-text-secondary mb-1 tracking-wider">Cloud Cover</span>
                                  <span className="font-semibold text-primary">{Number(cdBeforeSelectedScene.cloudCoverage).toFixed(2)}%</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-text-secondary mb-1 tracking-wider">Tile</span>
                                  <span className="font-mono text-text-secondary text-xs">{cdBeforeSelectedScene.tile}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-text-secondary mb-1 tracking-wider">Product ID</span>
                                  <span className="font-mono text-[10px] text-text-secondary truncate block w-full" title={cdBeforeSelectedScene.id}>{cdBeforeSelectedScene.id.substring(0, 18)}...</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Visual temporal separator */}
                        {cdBeforeSelectedScene && cdAfterSelectedScene && (
                           <div className="flex flex-col items-center -my-2 relative z-10">
                              <div className="h-4 border-l border-dashed border-accent"></div>
                              <div className="bg-white border border-accent px-2 py-0.5 rounded-full text-text-secondary shadow-sm text-[10px] font-bold uppercase tracking-widest">
                                Temporal Shift
                              </div>
                              <div className="h-4 border-l border-dashed border-accent"></div>
                           </div>
                        )}

                        {/* AFTER Scene */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                              T2 (After Scene)
                              {cdAfterSelectedScene && <span className="w-2.5 h-2.5 rounded-full bg-[#228B22]"></span>}
                            </label>
                          </div>
                          
                          {!cdAfterSelectedScene ? (
                            <div className="p-5 border border-accent rounded-xl bg-background/50">
                              <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">From Date</label>
                                  <input type="date" value={cdAfterDateFrom} onChange={(e) => setCdAfterDateFrom(e.target.value)} className="w-full text-[13px] p-2 border border-accent rounded-lg" />
                                </div>
                                <div className="flex-1">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">To Date</label>
                                  <input type="date" value={cdAfterDateTo} onChange={(e) => setCdAfterDateTo(e.target.value)} className="w-full text-[13px] p-2 border border-accent rounded-lg" />
                                </div>
                                <div className="w-24">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">Max Cloud%</label>
                                  <input type="number" value={cdAfterMaxCloud} onChange={(e) => setCdAfterMaxCloud(Number(e.target.value))} className="w-full text-[13px] p-2 border border-accent rounded-lg" />
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => searchScenes('after')} 
                                disabled={isCdAfterPrepLoading}
                                className="w-full py-2.5 px-4 bg-white border border-accent text-primary text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#faf7f5] transition-colors disabled:opacity-50 shadow-sm"
                              >
                                {isCdAfterPrepLoading ? 'Searching Copernicus STAC...' : 'Search T2 Scenes'}
                              </button>

                              {cdAfterSearchError && (
                                <div className="mt-3 p-3 bg-[#F8DED4]/50 border border-[#F8DED4] text-primary text-[11px] rounded-lg font-medium">
                                  {cdAfterSearchError}
                                </div>
                              )}
                              
                              {cdAfterPrepResult && cdAfterPrepResult.scenes && cdAfterPrepResult.scenes.length > 0 && (
                                <div className="mt-4 border border-accent rounded-lg overflow-hidden bg-white shadow-sm">
                                  <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-[#faf7f5] sticky top-0 border-b border-accent z-10">
                                        <tr>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Acquisition Date</th>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Cloud</th>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Tile</th>
                                          <th className="p-3 text-right"></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {cdAfterPrepResult.scenes.map((scene: any) => (
                                          <tr key={scene.id} className="border-b border-accent/30 hover:bg-[#faf7f5]">
                                            <td className="p-3 font-medium">{new Date(scene.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                            <td className="p-3">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${scene.cloudCoverage < 5 ? 'bg-green-100 text-green-700' : scene.cloudCoverage < 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {Number(scene.cloudCoverage).toFixed(1)}%
                                              </span>
                                            </td>
                                            <td className="p-3 text-text-secondary font-mono">{scene.tile}</td>
                                            <td className="p-3 text-right">
                                              <button 
                                                onClick={() => {
                                                  setCdAfterSelectedScene(scene);
                                                  if (cdBeforeSelectedScene) {
                                                    setOpenSections(prev => ({ ...prev, scenes: false, analysis: true }));
                                                  }
                                                }}
                                                className="text-[10px] bg-secondary text-primary px-3 py-1.5 rounded font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-colors"
                                              >
                                                Select
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-[#faf7f5] p-5 rounded-xl border border-[#e2d5c8] shadow-sm">
                              <div className="flex justify-between items-start mb-4 border-b border-[#e2d5c8]/60 pb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] uppercase font-bold text-[#8a7a6b] tracking-widest">✓ T2 Scene Selected</span>
                                </div>
                                <button onClick={() => setCdAfterSelectedScene(null)} className="text-[10px] font-bold text-[#8a7a6b] hover:text-red-500 uppercase tracking-wider border border-transparent hover:border-red-200 px-2 py-1 rounded transition-colors">Change</button>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-[13px]">
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-text-secondary mb-1 tracking-wider">Date</span>
                                  <span className="font-semibold text-primary">{new Date(cdAfterSelectedScene.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-text-secondary mb-1 tracking-wider">Cloud Cover</span>
                                  <span className="font-semibold text-primary">{Number(cdAfterSelectedScene.cloudCoverage).toFixed(2)}%</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-text-secondary mb-1 tracking-wider">Tile</span>
                                  <span className="font-mono text-text-secondary text-xs">{cdAfterSelectedScene.tile}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-text-secondary mb-1 tracking-wider">Product ID</span>
                                  <span className="font-mono text-[10px] text-text-secondary truncate block w-full" title={cdAfterSelectedScene.id}>{cdAfterSelectedScene.id.substring(0, 18)}...</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Prepare & Validate Accordion */}
                {selectedAoi && cdBeforeSelectedScene && cdAfterSelectedScene && (
                  <div className="bg-white rounded-xl border border-accent shadow-[0_12px_40px_rgba(91,74,62,0.06)] overflow-hidden shrink-0">
                    <button 
                      onClick={() => toggleSection('analysis')}
                      className="w-full flex justify-between items-center p-4 bg-background/30 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">3. Validate & Process</span>
                        {cdValidationResult?.success && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                      </div>
                      <span className="text-text-secondary font-mono text-[10px]">{openSections.analysis ? '▼' : '▶'}</span>
                    </button>
                    
                    {openSections.analysis && (
                      <div className="p-5 border-t border-accent/50 bg-white">
                        <button
                          onClick={prepareChangeDetectionData}
                          disabled={isCdDownloading || isCdValidating}
                          className="w-full py-3.5 px-4 bg-primary text-white text-[13px] font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm uppercase tracking-wider flex items-center justify-center gap-3"
                        >
                          {(isCdDownloading || isCdValidating) ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              {isCdDownloading ? 'Downloading Dual Scenes...' : 'Validating Raster Alignment...'}
                            </>
                          ) : (
                            'Prepare Change Detection Data'
                          )}
                        </button>
                        
                        {cdDownloadError && (
                          <div className="mt-4 p-4 bg-[#F8DED4]/50 border border-[#F8DED4] text-primary text-xs rounded-lg font-medium">
                            {cdDownloadError}
                          </div>
                        )}
                        
                        {cdValidationError && (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-mono">
                            <div className="font-bold mb-1">Spatial Grid Mismatch</div>
                            {cdValidationError}
                          </div>
                        )}

                        {cdValidationResult && cdValidationResult.success && (
                          <div className="mt-5 p-5 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3 text-emerald-700 mb-4 border-b border-emerald-200/50 pb-3">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-sm">✓</div>
                              <span className="font-bold text-[13px] uppercase tracking-wider">Rasters Compatible</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-[11px] text-emerald-900 font-mono">
                              <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                                <span className="text-emerald-500 text-[9px] font-bold uppercase block mb-1">Grid Dimensions</span>
                                {cdValidationResult.width} × {cdValidationResult.height}
                              </div>
                              <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                                <span className="text-emerald-500 text-[9px] font-bold uppercase block mb-1">CRS</span>
                                {cdValidationResult.crs}
                              </div>
                              <div className="col-span-2 bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                                <span className="text-emerald-500 text-[9px] font-bold uppercase block mb-1">Format</span>
                                13 Bands • Float32
                              </div>
                            </div>
                            <p className="mt-4 text-[11px] text-emerald-600 font-medium">
                              {cdValidationResult.message}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* 5. Spectral Change Detection & Classification Accordion */}
                {cdValidationResult && cdValidationResult.success && (
                  <div className="bg-white rounded-xl border border-accent shadow-[0_12px_40px_rgba(91,74,62,0.06)] overflow-hidden shrink-0">
                    <button 
                      onClick={() => toggleSection('results')}
                      className="w-full flex justify-between items-center p-4 bg-background/30 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">4. Results & Statistics</span>
                        {cdDetectResult?.success && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                      </div>
                      <span className="text-text-secondary font-mono text-[10px]">{openSections.results ? '▼' : '▶'}</span>
                    </button>
                    
                    {openSections.results && (
                      <div className="p-5 border-t border-accent/50 bg-white space-y-6">
                        
                        <button
                          onClick={calculateNdviChange}
                          disabled={isCdDetecting}
                          className="w-full py-3.5 px-4 bg-[#8a7a6b] text-white text-[13px] font-bold rounded-xl hover:bg-[#726356] transition-colors disabled:opacity-50 shadow-sm uppercase tracking-wider flex items-center justify-center gap-3"
                        >
                          {isCdDetecting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Calculating Continuous NDVI Change...
                            </>
                          ) : (
                            'Calculate NDVI Change'
                          )}
                        </button>
                        
                        {cdDetectError && (
                          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                            {cdDetectError}
                          </div>
                        )}
                        
                        {cdDetectResult && cdDetectResult.success && (
                          <div className="p-6 bg-white border border-[#e2d5c8] rounded-xl shadow-[0_4px_20px_rgba(138,122,107,0.06)]">
                            <div className="flex items-center gap-3 text-[#8a7a6b] mb-5 border-b border-accent pb-4">
                              <div className="w-8 h-8 rounded-lg bg-[#faf7f5] flex items-center justify-center border border-[#e2d5c8] text-lg">📊</div>
                              <span className="font-bold text-[13px] uppercase tracking-widest text-foreground">Spectral Change Results</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5 mb-6">
                              <div>
                                <div className="text-[10px] uppercase font-bold text-text-secondary mb-1.5 tracking-wider">Valid Pixels</div>
                                <div className="text-[13px] font-mono font-bold text-primary bg-background p-2.5 rounded-lg border border-accent">
                                  {cdDetectResult.validPixels.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase font-bold text-text-secondary mb-1.5 tracking-wider">Masked (Cloud/Shadow)</div>
                                <div className="text-[13px] font-mono font-bold text-orange-700 bg-orange-50 p-2.5 rounded-lg border border-orange-100">
                                  {cdDetectResult.maskedPixels.toLocaleString()}
                                </div>
                              </div>
                              
                              <div className="col-span-2 mt-2">
                                <div className="text-[10px] uppercase font-bold text-text-secondary mb-2.5 tracking-wider">NDVI Change Statistics</div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="bg-background p-3 rounded-lg border border-accent text-center">
                                    <span className="text-[9px] font-bold uppercase text-text-secondary block mb-1">Min</span>
                                    <span className="font-mono text-xs font-bold text-primary">{Number(cdDetectResult.minChange).toFixed(3)}</span>
                                  </div>
                                  <div className="bg-background p-3 rounded-lg border border-accent text-center">
                                    <span className="text-[9px] font-bold uppercase text-text-secondary block mb-1">Mean</span>
                                    <span className="font-mono text-xs font-bold text-primary">{Number(cdDetectResult.meanChange).toFixed(3)}</span>
                                  </div>
                                  <div className="bg-background p-3 rounded-lg border border-accent text-center">
                                    <span className="text-[9px] font-bold uppercase text-text-secondary block mb-1">Max</span>
                                    <span className="font-mono text-xs font-bold text-primary">{Number(cdDetectResult.maxChange).toFixed(3)}</span>
                                  </div>
                                </div>
                                <div className="mt-4 text-[11px] text-text-secondary bg-[#faf7f5] p-3 rounded-lg border border-accent/60 leading-relaxed">
                                  Positive values indicate vegetation increase. Negative values indicate vegetation decrease. Cloud and shadow pixels were explicitly set to NaN based on SCL.
                                </div>
                              </div>
                            </div>

                            {/* 6. Classify Change */}
                            <div className="pt-6 border-t border-accent">
                              <h4 className="font-bold text-[11px] text-primary uppercase tracking-widest mb-4">Change Map & Area Statistics</h4>
                              <div className="flex flex-col gap-4 mb-5">
                                <div>
                                  <label className="text-[10px] font-bold text-text-secondary uppercase block mb-2 tracking-wider">Threshold (±)</label>
                                  <div className="flex items-center gap-4 bg-background p-3 rounded-lg border border-accent">
                                    <input 
                                      type="range" 
                                      min="0.05" 
                                      max="0.5" 
                                      step="0.01" 
                                      value={changeThreshold}
                                      onChange={(e) => setChangeThreshold(Number(e.target.value))}
                                      className="w-full accent-primary"
                                    />
                                    <span className="text-[13px] font-mono font-bold text-primary w-12 text-right">{changeThreshold.toFixed(2)}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={classifyChangeMap}
                                  disabled={isClassifyingChange}
                                  className="w-full py-3 px-4 bg-primary text-white text-[11px] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                  {isClassifyingChange ? 'Classifying...' : 'Classify Change'}
                                </button>
                              </div>

                              {changeClassifyError && (
                                <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                                  {changeClassifyError}
                                </div>
                              )}

                              {changeClassifyResult && changeClassifyResult.success && (
                                <div className="mt-6 border border-accent/60 rounded-xl overflow-hidden shadow-sm bg-background">
                                  <div className="px-4 py-3 bg-background border-b border-accent/60 flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Categorical Change Map</span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[9px] bg-secondary text-primary px-2.5 py-1 rounded font-bold uppercase tracking-wider">Threshold: ±{changeClassifyResult.threshold}</span>
                                      <button 
                                        onClick={() => setIsFullScreenMapOpen(true)}
                                        className="text-[9px] bg-white border border-accent text-primary px-3 py-1 rounded font-bold uppercase tracking-wider hover:bg-[#faf7f5] hover:border-primary transition-colors shadow-sm flex items-center gap-1"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                                        View Full Screen
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col xl:flex-row gap-5 p-5">
                                    <div className="flex-1">
                                      <div className="aspect-square w-full bg-white rounded-xl border border-accent overflow-hidden relative flex items-center justify-center p-2 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                                        {changeClassifyResult.previewBase64 ? (
                                          <img 
                                            src={`data:image/png;base64,${changeClassifyResult.previewBase64}`} 
                                            alt="Change Preview" 
                                            className="w-full h-full object-contain drop-shadow-md"
                                          />
                                        ) : (
                                          <span className="text-xs text-text-secondary font-medium">No Preview Generated</span>
                                        )}
                                      </div>
                                      <div className="mt-4 flex flex-wrap gap-2.5 text-[9px] font-bold">
                                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#228B22] shadow-sm"></span> INCREASE</div>
                                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#DC143C] shadow-sm"></span> DECREASE</div>
                                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 border border-dashed border-gray-400 rounded-full"></span> UNCHANGED</div>
                                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-300 opacity-50"></span> MASKED</div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex-1 space-y-4">
                                      <div className="p-4 bg-white border border-accent rounded-xl shadow-sm">
                                        <div className="text-[10px] font-bold text-text-secondary uppercase mb-3 tracking-wider">Area Statistics (Valid)</div>
                                        <div className="space-y-3 text-[13px]">
                                          <div className="flex justify-between items-center pb-2 border-b border-accent/40">
                                            <span className="flex items-center gap-2 font-medium text-foreground"><span className="w-2.5 h-2.5 rounded-full bg-[#228B22] shadow-sm"></span> Increase</span>
                                            <span className="font-mono font-bold text-primary">{Number(changeClassifyResult.increaseAreaM2 / 10000).toFixed(2)} ha</span>
                                          </div>
                                          <div className="flex justify-between items-center pb-2 border-b border-accent/40">
                                            <span className="flex items-center gap-2 font-medium text-foreground"><span className="w-2.5 h-2.5 rounded-full bg-[#DC143C] shadow-sm"></span> Decrease</span>
                                            <span className="font-mono font-bold text-primary">{Number(changeClassifyResult.decreaseAreaM2 / 10000).toFixed(2)} ha</span>
                                          </div>
                                          <div className="flex justify-between items-center pb-2 border-b border-accent/40">
                                            <span className="flex items-center gap-2 font-medium text-foreground"><span className="w-2.5 h-2.5 border border-gray-300 rounded-full"></span> Unchanged</span>
                                            <span className="font-mono font-bold text-primary">{Number(changeClassifyResult.unchangedAreaM2 / 10000).toFixed(2)} ha</span>
                                          </div>
                                          <div className="flex justify-between items-center pt-1 font-bold text-primary text-[14px]">
                                            <span>Total Changed</span>
                                            <span className="font-mono">{Number(changeClassifyResult.changedAreaM2 / 10000).toFixed(2)} ha</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="p-4 bg-white border border-accent rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Change Proportion</div>
                                          <div className="text-base font-bold text-primary font-mono">{Number(changeClassifyResult.changedAreaPercent).toFixed(1)}%</div>
                                        </div>
                                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                                          <div className="h-full bg-[#228B22]" style={{ width: `${(changeClassifyResult.increaseAreaM2 / changeClassifyResult.totalValidAreaM2) * 100}%` }}></div>
                                          <div className="h-full bg-[#DC143C]" style={{ width: `${(changeClassifyResult.decreaseAreaM2 / changeClassifyResult.totalValidAreaM2) * 100}%` }}></div>
                                        </div>
                                      </div>
                                      
                                      <div className="text-[10px] text-text-secondary bg-[#faf7f5] p-3 rounded-lg border border-[#e2d5c8] leading-relaxed">
                                        <strong className="text-[#8a7a6b] block mb-1">Scientific Note</strong> Change is detected from NDVI difference. Results indicate vegetation-signal change and should be interpreted with imagery context. 
                                        <em> ({changeClassifyResult.maskedPixels.toLocaleString()} masked pixels excluded).</em>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

{/* PLACEHOLDERS FOR OTHER TABS */}
            {activeTab !== 'overview' && activeTab !== 'classification' && activeTab !== 'change' && (
              <div className="bg-white p-6 rounded-xl border border-accent shadow-[0_12px_40px_rgba(91,74,62,0.06)] flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="text-3xl mb-4 opacity-50">⚙️</div>
                <h2 className="text-lg font-bold text-foreground mb-2">{tabs.find(t => t.id === activeTab)?.label} Module</h2>
                <p className="text-text-secondary text-[13px] max-w-[200px] mx-auto">
                  This workflow is in development and will connect to our Random Forest pipeline soon.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Full Screen Categorical Change Modal */}
      {isFullScreenMapOpen && changeClassifyResult && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
          onClick={() => setIsFullScreenMapOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="bg-[#faf7f5] w-full max-w-7xl max-h-full rounded-2xl shadow-2xl flex flex-col border border-[#e2d5c8] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-[#e2d5c8] bg-white">
              <h2 id="modal-title" className="text-lg font-bold text-foreground uppercase tracking-widest">Categorical Change Analysis</h2>
              <button 
                onClick={() => setIsFullScreenMapOpen(false)}
                className="text-text-secondary hover:text-foreground bg-secondary px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors border border-transparent hover:border-accent"
                aria-label="Close modal"
              >
                Close
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Map Container - scrolls independently if image is huge, but object-contain is better for fit */}
              <div className="flex-1 bg-white p-6 flex items-center justify-center relative overflow-auto border-r border-[#e2d5c8]">
                {changeClassifyResult.previewBase64 ? (
                  <img 
                    src={`data:image/png;base64,${changeClassifyResult.previewBase64}`} 
                    alt="Change Preview Full Screen" 
                    className="max-w-full max-h-[70vh] object-contain drop-shadow-xl border border-accent/30 rounded-xl"
                  />
                ) : (
                  <span className="text-sm text-text-secondary font-medium">No Preview Generated</span>
                )}
              </div>
              
              {/* Info Panel - fixed width on desktop, scrolling if needed */}
              <div className="w-full lg:w-96 bg-[#faf7f5] overflow-y-auto p-6 space-y-6">
                
                {/* Legend */}
                <div>
                  <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Legend</h3>
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-[#e2d5c8] shadow-sm">
                    <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                      <span className="w-4 h-4 rounded-full bg-[#228B22] shadow-inner border border-black/10"></span> VEGETATION INCREASE
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                      <span className="w-4 h-4 rounded-full bg-[#DC143C] shadow-inner border border-black/10"></span> VEGETATION DECREASE
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                      <span className="w-4 h-4 border-2 border-dashed border-gray-400 rounded-full"></span> NO SIGNIFICANT CHANGE
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-foreground opacity-60">
                      <span className="w-4 h-4 rounded-full bg-gray-300 border border-black/10"></span> MASKED
                    </div>
                  </div>
                </div>
                
                {/* Statistics */}
                <div>
                  <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Analysis Information</h3>
                  <div className="bg-white p-4 rounded-xl border border-[#e2d5c8] shadow-sm space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-accent/40">
                      <span className="text-text-secondary font-medium">Threshold</span>
                      <span className="font-mono font-bold text-primary">±{changeClassifyResult.threshold}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-accent/40">
                      <span className="text-text-secondary font-medium">Vegetation Increase</span>
                      <span className="font-mono font-bold text-[#228B22]">{Number(changeClassifyResult.increaseAreaM2 / 10000).toFixed(2)} ha</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-accent/40">
                      <span className="text-text-secondary font-medium">Vegetation Decrease</span>
                      <span className="font-mono font-bold text-[#DC143C]">{Number(changeClassifyResult.decreaseAreaM2 / 10000).toFixed(2)} ha</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-accent/40">
                      <span className="text-text-secondary font-medium">No Significant Change</span>
                      <span className="font-mono font-bold text-foreground">{Number(changeClassifyResult.unchangedAreaM2 / 10000).toFixed(2)} ha</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-accent/40">
                      <span className="text-text-secondary font-medium text-xs">Total Changed Area</span>
                      <span className="font-mono font-bold text-primary">{Number(changeClassifyResult.changedAreaM2 / 10000).toFixed(2)} ha</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-accent/40">
                      <span className="text-text-secondary font-medium text-xs">Changed Area (%)</span>
                      <span className="font-mono font-bold text-primary">{Number(changeClassifyResult.changedAreaPercent).toFixed(2)}%</span>
                    </div>
                    {cdDetectResult && (
                      <>
                        <div className="flex justify-between items-center pb-2 border-b border-accent/40">
                          <span className="text-text-secondary font-medium text-xs">Valid Area</span>
                          <span className="font-mono font-bold text-foreground">{Number(changeClassifyResult.totalValidAreaM2 / 10000).toFixed(2)} ha</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary font-medium text-xs">Masked Pixels</span>
                          <span className="font-mono font-bold text-text-secondary">{cdDetectResult.maskedPixels.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Provenance */}
                <div>
                  <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Analysis Provenance</h3>
                  <div className="bg-white p-4 rounded-xl border border-[#e2d5c8] shadow-sm space-y-2 text-xs">
                    <div className="grid grid-cols-3">
                      <span className="text-text-secondary font-bold">Data</span>
                      <span className="col-span-2 text-foreground">Sentinel-2 L2A</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-text-secondary font-bold">Before</span>
                      <span className="col-span-2 text-foreground truncate" title={cdBeforeSelectedScene?.date}>{cdBeforeSelectedScene ? new Date(cdBeforeSelectedScene.date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-text-secondary font-bold">After</span>
                      <span className="col-span-2 text-foreground truncate" title={cdAfterSelectedScene?.date}>{cdAfterSelectedScene ? new Date(cdAfterSelectedScene.date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-text-secondary font-bold">AOI</span>
                      <span className="col-span-2 text-foreground">User Polygon</span>
                    </div>
                    <div className="grid grid-cols-3 pt-2 border-t border-accent/40 mt-1">
                      <span className="text-text-secondary font-bold">Method</span>
                      <span className="col-span-2 text-foreground">NDVI Temporal Differencing</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-text-secondary font-bold">Classify</span>
                      <span className="col-span-2 text-foreground">Threshold ±{changeClassifyResult.threshold}</span>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

