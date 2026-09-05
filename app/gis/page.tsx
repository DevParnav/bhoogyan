"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import { predictionDemoDatasets, type PredictionDemoDataset, riskDemoDatasets, type RiskDemoDataset, suitabilityDemoDatasets, type SuitabilityDemoDataset } from '../data/landIntelligenceDemoData';

import { useCallback } from 'react';

// Dynamically import MapComponent to prevent SSR issues with Leaflet's window dependency
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-border/20 animate-pulse flex items-center justify-center text-text-secondary font-medium">Loading GIS Map...</div>
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type Tab = 'overview' | 'classification' | 'change' | 'prediction' | 'risk' | 'suitability';
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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

  // Split-Pane Layout States
  const [mapWidthPct, setMapWidthPct] = useState<number>(62);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    // Load saved width on mount
    const saved = localStorage.getItem('bhoogyan-gis-map-width');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 40 && parsed <= 75) {
        setMapWidthPct(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Calculate width percentage based on viewport width
      const newPct = (e.clientX / window.innerWidth) * 100;
      // Clamp between 40 and 75
      const clamped = Math.max(40, Math.min(75, newPct));
      setMapWidthPct(clamped);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      localStorage.setItem('bhoogyan-gis-map-width', mapWidthPct.toString());
      // Force leaflet map invalidation
      setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Disable text selection and pointer events on iframes/maps while dragging
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.userSelect = '';
      localStorage.setItem('bhoogyan-gis-map-width', mapWidthPct.toString());
    };
  }, [isResizing, mapWidthPct]);

  // Demo Data States
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionDemoDataset | null>(null);
  const [isSimulatingPrediction, setIsSimulatingPrediction] = useState(false);
  const [predictionStatusMessage, setPredictionStatusMessage] = useState<string>('');

  const [selectedRisk, setSelectedRisk] = useState<RiskDemoDataset | null>(null);
  const [isSimulatingRisk, setIsSimulatingRisk] = useState(false);
  const [riskStatusMessage, setRiskStatusMessage] = useState<string>('');

  const [selectedSuitability, setSelectedSuitability] = useState<SuitabilityDemoDataset | null>(null);
  const [isSimulatingSuitability, setIsSimulatingSuitability] = useState(false);
  const [suitabilityStatusMessage, setSuitabilityStatusMessage] = useState<string>('');

  const simulatePrediction = async () => {
    setIsSimulatingPrediction(true);
    setPredictionStatusMessage('Initializing demo data...');
    await delay(800);
    setPredictionStatusMessage('Running prediction model...');
    await delay(1200);
    const randomData = predictionDemoDatasets[Math.floor(Math.random() * predictionDemoDatasets.length)];
    setSelectedPrediction(randomData);
    setIsSimulatingPrediction(false);
    setPredictionStatusMessage('');
  };

  const simulateRisk = async () => {
    setIsSimulatingRisk(true);
    setRiskStatusMessage('Gathering risk indicators...');
    await delay(700);
    setRiskStatusMessage('Analyzing anomalies...');
    await delay(1300);
    const randomData = riskDemoDatasets[Math.floor(Math.random() * riskDemoDatasets.length)];
    setSelectedRisk(randomData);
    setIsSimulatingRisk(false);
    setRiskStatusMessage('');
  };

  const simulateSuitability = async () => {
    setIsSimulatingSuitability(true);
    setSuitabilityStatusMessage('Collecting suitability metrics...');
    await delay(600);
    setSuitabilityStatusMessage('Evaluating scenarios...');
    await delay(1400);
    const randomData = suitabilityDemoDatasets[Math.floor(Math.random() * suitabilityDemoDatasets.length)];
    setSelectedSuitability(randomData);
    setIsSimulatingSuitability(false);
    setSuitabilityStatusMessage('');
  };

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
    if (!selectedAoi) {
      setClassificationError("Please select an area on the map first.");
      return;
    }

    setIsClassifying(true);
    setClassificationError(null);
    setClassificationResult(null);

    try {
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
    if (!selectedAoi || !selectedScene) return;

    setIsClassifying(true);
    setClassificationError(null);
    setClassificationResult(null);

    try {
      const response = await fetch('/api/gis/classification/sentinel2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aoi: selectedAoi, scene: selectedScene }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to classify land cover.');
      }

      setClassificationResult({
        source: data.source || 'Real Sentinel-2 + LULC U-Net',
        type: 'unet',
        raw_response: data
      });
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
    console.log('[CHANGE_VALIDATE] start');
    if (!selectedAoi || !cdBeforeSelectedScene || !cdAfterSelectedScene) return;

    if (cdBeforeSelectedScene.id === cdAfterSelectedScene.id) {
      setCdDownloadError("BEFORE and AFTER scenes cannot be the exact same scene.");
      return;
    }

    // Demo mode fallback
    if (isDemo) {
      setIsCdDownloading(true);
      setCdDownloadError(null);
      await delay(3000);
      // Load mock validation result
      const demoRes = await fetch('/api/gis/change/demoResult');
      const demoData = await demoRes.json();
      setCdValidationResult(demoData.validation);
      setCdDetectResult(demoData.detection);
      setIsCdDownloading(false);
      return;
    }

    setCdDownloadError(null);
    setCdValidationResult(null);
    setCdValidationError(null);

    try {
      // 1. Download Both in Parallel
      // Download BEFORE and AFTER scenes with timeout handling
      const controllerBefore = new AbortController();
      const timeoutBefore = setTimeout(() => controllerBefore.abort(), 30000); // 30s timeout
      const beforePromise = fetch('/api/gis/sentinel2/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controllerBefore.signal,
        body: JSON.stringify({ aoi: selectedAoi, scene: cdBeforeSelectedScene }),
      }).finally(() => clearTimeout(timeoutBefore));

      const controllerAfter = new AbortController();
      const timeoutAfter = setTimeout(() => controllerAfter.abort(), 30000); // 30s timeout
      const afterPromise = fetch('/api/gis/sentinel2/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controllerAfter.signal,
        body: JSON.stringify({ aoi: selectedAoi, scene: cdAfterSelectedScene }),
      }).finally(() => clearTimeout(timeoutAfter));

      const [beforeRes, afterRes] = await Promise.all([beforePromise, afterPromise]);

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
    <div className="w-full px-4 lg:px-6 pb-6 flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex-shrink-0">
        <Header
          breadcrumbs={[{ label: 'Land Intelligence' }]}
          title="Land Intelligence"
          subtitle="Explore, analyse and understand land-use dynamics."
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6 flex-shrink-0">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? 'border-[var(--color-gis)] text-gis'
                  : 'border-transparent text-text-secondary hover:text-foreground hover:border-border'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden pb-4">
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(280px,0.8fr)_minmax(450px,1.8fr)_minmax(320px,1fr)] h-full gap-4 lg:gap-4 relative">

          {/* Center Panel: Map Container */}
          <div className="col-start-2 flex flex-col h-full z-0 w-full bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="bg-surface rounded-xl border border-border shadow-[0_12px_40px_rgba(91,74,62,0.06)] overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50 flex-shrink-0">
                <h3 className="font-semibold text-foreground">Interactive GIS Map</h3>
                {selectedAoi ? (
                  <span className="text-xs bg-gis-light text-gis px-2 py-1 rounded font-medium shadow-sm">AOI Selected</span>
                ) : (
                  <span className="text-xs text-text-secondary px-2 py-1">Draw an AOI to begin</span>
                )}
              </div>
              <div className="flex-1 relative bg-muted">
                <MapComponent onAoiCreated={handleAoiCreated} onAoiCleared={handleAoiCleared} />
              </div>
            </div>
          </div>

          {/* Resize Handle (Desktop Only) */}
          <div
            className="hidden lg:flex w-[16px] flex-shrink-0 cursor-col-resize justify-center items-center group relative z-10"
            onPointerDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
          >
            <div className={`w-1 h-12 rounded-full transition-colors ${isResizing ? 'bg-gis' : 'bg-border group-hover:bg-gis/50'}`} />
            {/* Extended hit area */}
            <div className="absolute inset-y-0 -inset-x-2 bg-transparent" />
          </div>

          {/* Side Panels Based on Tab */}
          <div className="contents">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                <div className="bg-surface p-6 rounded-xl border border-border shadow-[0_12px_40px_rgba(91,74,62,0.06)]">
                  <h3 className="font-semibold text-foreground mb-4">Active Monitoring Zones</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center p-3 bg-muted rounded-lg border border-border">
                      <span className="font-medium text-foreground">Mulshi Buffer Zone</span>
                      <span className="text-[10px] uppercase font-bold text-gis bg-gis-light px-2 py-1 rounded">Tracking</span>
                    </li>
                    <li className="flex justify-between items-center p-3 bg-muted rounded-lg border border-border">
                      <span className="font-medium text-foreground">Maval Riparian</span>
                      <span className="text-[10px] uppercase font-bold text-gis bg-gis-light px-2 py-1 rounded">Tracking</span>
                    </li>
                  </ul>
                </div>
              </>
            )}

            {/* CLASSIFICATION TAB */}
            {activeTab === 'classification' && (
              <>
                <div className="col-start-1 h-full overflow-y-auto pr-2 space-y-6">
                  <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col gap-5">
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
                      <div className="p-3 bg-muted border border-border rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gis flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            AOI Status: Selected
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">Format: GeoJSON {selectedAoi.geometry?.type}</div>
                        </div>
                        <button
                          onClick={handleAoiCleared}
                          className="text-xs font-semibold text-gis hover:text-white bg-gis-light hover:bg-gis px-3 py-1.5 rounded transition-colors shadow-sm"
                        >
                          Clear AOI
                        </button>
                      </div>

                      {/* Debug view */}
                      <details className="text-[10px] text-text-secondary bg-gis-light/30 p-2 rounded border border-border cursor-pointer">
                        <summary className="font-semibold uppercase tracking-widest">AOI GeoJSON Data (Debug)</summary>
                        <pre className="mt-2 overflow-auto max-h-32 text-[9px] bg-surface p-2 rounded border border-border">
                          {JSON.stringify(selectedAoi, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted border border-border border-dashed rounded-lg text-center text-[13px] text-text-secondary">
                      <div className="font-medium text-foreground mb-1">AOI Status: No area selected</div>
                      Draw a polygon or rectangle on the map.
                    </div>
                  )}
                </div>

                {/* 2. Data Source */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">2. Data Source</label>
                  <select className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-gis">
                    <option value="bhuvan">Bhuvan LULC AOI Wise (Connected)</option>
                    <option value="bhoonidhi" disabled>Bhoonidhi Satellite Data (Not connected yet)</option>
                  </select>
                </div>

                {/* 3. Classification Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">3. Classification Type</label>
                  <select className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-gis">
                    <option value="lulc">Land Use / Land Cover (LULC)</option>
                  </select>
                </div>

                {/* 4. Model */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">4. Model</label>
                  <select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-gis">
                    <option value="bhuvan_api">Bhuvan API</option>
                    <option value="unet_real">LULC U-Net (Production)</option>
                  </select>
                  {modelType === 'unet_real' && (
                    <div className="text-[10px] font-bold text-gis mt-1 bg-gis-light inline-block px-2 py-0.5 rounded shadow-sm">
                      Real-time Sentinel-2 AOI Inference
                    </div>
                  )}
                </div>

                {/* 5. Execution Pipeline */}
                {modelType !== 'unet_real' && (
                  <div className="pt-2">
                    <button
                      onClick={runClassification}
                      disabled={!selectedAoi || isClassifying}
                      className="w-full py-3 px-4 bg-gis text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                    >
                      {isClassifying ? 'Analyzing...' : 'Run Classification'}
                    </button>

                    {classificationError && (
                      <div className="mt-3 p-3 bg-[#F8DED4]/50 border border-[#F8DED4] text-gis text-xs rounded-lg">
                        {classificationError}
                      </div>
                    )}
                  </div>
                )}

                {/* Real U-Net Workflow: Prepare Sentinel-2 Data */}
                {selectedAoi && modelType === 'unet_real' && (
                  <div className="pt-2 border-t border-border mt-2">
                    <div className="text-[11px] font-bold text-text-secondary uppercase mb-3 tracking-widest">Sentinel-2 Search</div>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-text-secondary uppercase">From</label>
                        <input type="date" value={s2DateFrom} onChange={(e) => setS2DateFrom(e.target.value)} className="w-full text-xs p-1.5 border border-border rounded" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-text-secondary uppercase">To</label>
                        <input type="date" value={s2DateTo} onChange={(e) => setS2DateTo(e.target.value)} className="w-full text-xs p-1.5 border border-border rounded" />
                      </div>
                      <div className="w-16">
                        <label className="text-[9px] font-bold text-text-secondary uppercase">Cloud%</label>
                        <input type="number" value={s2MaxCloud} onChange={(e) => setS2MaxCloud(Number(e.target.value))} className="w-full text-xs p-1.5 border border-border rounded" />
                      </div>
                    </div>

                    <button
                      onClick={prepareSentinel2Data}
                      disabled={isPrepLoading}
                      className="w-full py-2 px-4 bg-gis-light text-gis text-sm font-medium rounded-xl hover:bg-gis hover:text-white transition-colors disabled:opacity-50 shadow-sm border border-gis/20"
                    >
                      {isPrepLoading ? 'Searching Copernicus STAC...' : 'Find Sentinel-2 Scenes'}
                    </button>

                    {prepError && (
                      <div className="mt-3 p-3 bg-[#F8DED4]/50 border border-[#F8DED4] text-gis text-xs rounded-lg">
                        {prepError}
                      </div>
                    )}

                    {prepResult && (
                      <div className="mt-3 p-3 bg-muted border border-border rounded-lg text-[11px] text-text-secondary">
                        <div className="font-bold text-gis mb-2 uppercase tracking-widest flex justify-between">
                          <span>{prepResult.provider}</span>
                          <span className="bg-[#F8DED4] px-1.5 rounded text-[9px]">{prepResult.collection}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Sentinel-2 Scenes Found:</span>
                          <span className="font-bold text-foreground">{prepResult.count}</span>
                        </div>

                        {prepResult.scenes && prepResult.scenes.length === 0 && (
                          <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200">
                            No Sentinel-2 L2A scenes matched this AOI, date range, and cloud limit.
                          </div>
                        )}

                        {prepResult.scenes && prepResult.scenes.length > 0 && (
                          <div className="mt-2 border border-border rounded overflow-hidden max-h-48 overflow-y-auto">
                            <table className="w-full text-left text-[10px]">
                              <thead className="bg-gis-light/50 uppercase">
                                <tr>
                                  <th className="p-1.5 border-b border-border font-semibold">Date</th>
                                  <th className="p-1.5 border-b border-border font-semibold">Cloud</th>
                                  <th className="p-1.5 border-b border-border font-semibold">Tile</th>
                                  <th className="p-1.5 border-b border-border font-semibold">Select</th>
                                </tr>
                              </thead>
                              <tbody>
                                {prepResult.scenes.map((scene: any, i: number) => (
                                  <tr key={i} className={`border-b border-border/20 last:border-0 hover:bg-gis-light/30 ${selectedScene?.id === scene.id ? 'bg-gis-light' : ''}`}>
                                    <td className="p-1.5 whitespace-nowrap">{new Date(scene.date).toLocaleDateString()}</td>
                                    <td className="p-1.5">{Number(scene.cloudCoverage).toFixed(1)}%</td>
                                    <td className="p-1.5">{scene.tile}</td>
                                    <td className="p-1.5">
                                      <button
                                        onClick={() => setSelectedScene(scene)}
                                        className="text-[9px] font-bold bg-gis text-white px-2 py-1 rounded hover:opacity-80"
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

                        {selectedScene && (
                          <div className="mt-4 pt-3 border-t border-border">
                            <button
                              onClick={runRealClassification}
                              disabled={isClassifying}
                              className="w-full py-3 px-4 bg-emerald-600 text-white text-[13px] font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-md uppercase tracking-wide flex items-center justify-center gap-2"
                            >
                              {isClassifying ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Downloading & Running U-Net...
                                </>
                              ) : (
                                'Run LULC Classification'
                              )}
                            </button>

                            {classificationError && (
                              <div className="mt-3 p-3 bg-[#F8DED4]/50 border border-[#F8DED4] text-gis text-xs rounded-lg">
                                {classificationError}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                  </div>
                </div>
                <div className="col-start-3 h-full overflow-y-auto pl-2 space-y-6">
                  <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col gap-5">
                    {/* 6. Results View */}
                    {!classificationResult && (
                      <div className="text-center text-text-secondary text-sm p-4">Run classification to view results.</div>
                    )}
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
                        name: item.class_name || item.className || item.name || item.type || `Class ${idx + 1}`,
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
                    <div className="mt-2 pt-5 border-t border-border">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-foreground text-sm">Analysis Results</h4>
                        <span className="text-[10px] uppercase font-bold text-gis bg-[#F8DED4] px-2 py-1 rounded tracking-widest shadow-sm">
                          {classificationResult.source}
                        </span>
                      </div>

                      {isArray ? (
                        <>
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="p-3 bg-muted border border-border rounded-lg">
                              <div className="text-[10px] uppercase font-bold text-text-secondary mb-1">Dominant Cover</div>
                              <div className="text-sm font-semibold text-gis truncate">
                                {dominant ? dominant.name : 'Unknown'}
                              </div>
                            </div>
                            <div className="p-3 bg-muted border border-border rounded-lg">
                              <div className="text-[10px] uppercase font-bold text-text-secondary mb-1">Total Area</div>
                              <div className="text-sm font-semibold text-gis truncate">
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
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cls.percent}%`, backgroundColor: cls.color }}></div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {classificationResult.type === 'unet' && raw?.overlay && (
                            <div className="mt-5 border border-border rounded-xl overflow-hidden shadow-sm bg-muted">
                              <div className="px-3 py-2 bg-muted border-b border-border text-[10px] uppercase font-bold text-text-secondary">
                                Model Classification Overlay
                              </div>
                              <img src={`data:image/png;base64,${raw.overlay}`} alt="Classification Overlay" className="w-full h-auto object-contain" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-4 bg-muted border border-border rounded-lg text-[11px] text-text-secondary overflow-auto max-h-60">
                          <p className="font-bold mb-2 text-foreground">API Response Data:</p>
                          <pre>{JSON.stringify(raw, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })()}
                  </div>
                </div>
              </>
            )}

            {/* CHANGE DETECTION TAB */}
            {activeTab === 'change' && (
              <>
                <div className="col-start-1 h-full overflow-y-auto pr-2">
                  <div className="flex flex-col gap-4">

                    {/* Workspace Header & Controls */}
                    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm shrink-0">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Change Detection Workspace</h3>
                      <p className="text-[13px] text-text-secondary">
                        Select two temporal scenes for pixel-aligned change analysis.
                      </p>
                    </div>

                    {/* Panel Size Control */}
                    <div className="flex bg-muted border border-border rounded-lg p-1">
                      {(['compact', 'standard', 'wide'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setPanelMode(mode)}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded ${panelMode === mode
                              ? 'bg-surface text-gis shadow-sm border border-border'
                              : 'text-text-secondary hover:text-foreground hover:bg-surface/50'
                            }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="relative pt-2 pb-2">
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-border/50 -translate-y-1/2 z-0"></div>
                    <div className="relative z-10 flex justify-between">
                      <div className="flex flex-col items-center gap-1.5 bg-surface px-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${selectedAoi ? 'border-[#228B22] bg-[#228B22] text-white' : 'border-gis bg-gis text-white'}`}>1</div>
                        <span className={`text-[9px] uppercase font-bold ${selectedAoi ? 'text-[#228B22]' : 'text-gis'}`}>AOI</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 bg-surface px-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${(cdBeforeSelectedScene && cdAfterSelectedScene) ? 'border-[#228B22] bg-[#228B22] text-white' : (selectedAoi ? 'border-gis bg-surface text-gis' : 'border-border bg-muted text-text-secondary')}`}>2</div>
                        <span className={`text-[9px] uppercase font-bold ${(cdBeforeSelectedScene && cdAfterSelectedScene) ? 'text-[#228B22]' : (selectedAoi ? 'text-gis' : 'text-text-secondary')}`}>Scenes</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 bg-surface px-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${cdValidationResult?.success ? 'border-[#228B22] bg-[#228B22] text-white' : ((cdBeforeSelectedScene && cdAfterSelectedScene) ? 'border-gis bg-surface text-gis' : 'border-border bg-muted text-text-secondary')}`}>3</div>
                        <span className={`text-[9px] uppercase font-bold ${cdValidationResult?.success ? 'text-[#228B22]' : ((cdBeforeSelectedScene && cdAfterSelectedScene) ? 'text-gis' : 'text-text-secondary')}`}>Validate</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 bg-surface px-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${cdDetectResult?.success ? 'border-[#228B22] bg-[#228B22] text-white' : (cdValidationResult?.success ? 'border-gis bg-surface text-gis' : 'border-border bg-muted text-text-secondary')}`}>4</div>
                        <span className={`text-[9px] uppercase font-bold ${cdDetectResult?.success ? 'text-[#228B22]' : (cdValidationResult?.success ? 'text-gis' : 'text-text-secondary')}`}>Results</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. AOI Selection Accordion */}
                <div className="bg-surface rounded-xl border border-border shadow-[0_12px_40px_rgba(91,74,62,0.06)] overflow-hidden shrink-0">
                  <button
                    onClick={() => toggleSection('aoi')}
                    className="w-full flex justify-between items-center p-4 bg-muted/30 hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">1. Area of Interest</span>
                      {selectedAoi && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                    </div>
                    <span className="text-text-secondary font-mono text-[10px]">{openSections.aoi ? '▼' : '▶'}</span>
                  </button>

                  {openSections.aoi && (
                    <div className="p-5 border-t border-border bg-surface">
                      {selectedAoi ? (
                        <div className="flex flex-col gap-2">
                          <div className="p-4 bg-muted border border-border rounded-xl flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gis flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                AOI Status: Selected
                              </div>
                              <div className="text-xs text-text-secondary mt-1">Format: GeoJSON {selectedAoi.geometry?.type}</div>
                            </div>
                            <button
                              onClick={handleAoiCleared}
                              className="text-[11px] font-bold text-gis hover:text-white bg-gis-light hover:bg-gis px-4 py-2 rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                            >
                              Clear AOI
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 bg-muted border border-border border-dashed rounded-xl text-center text-[13px] text-text-secondary">
                          <div className="font-semibold text-foreground mb-2">AOI Status: No area selected</div>
                          Draw a polygon or rectangle on the interactive map to begin.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2 & 3. Scene Selection Accordions */}
                {selectedAoi && (
                  <div className="bg-surface rounded-xl border border-border shadow-[0_12px_40px_rgba(91,74,62,0.06)] overflow-hidden shrink-0">
                    <button
                      onClick={() => toggleSection('scenes')}
                      className="w-full flex justify-between items-center p-4 bg-muted/30 hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">2. Temporal Scenes</span>
                        {(cdBeforeSelectedScene || cdAfterSelectedScene) && <span className="text-[9px] bg-gis-light text-gis px-2 py-0.5 rounded font-bold uppercase tracking-wider">{[cdBeforeSelectedScene, cdAfterSelectedScene].filter(Boolean).length}/2 Selected</span>}
                      </div>
                      <span className="text-text-secondary font-mono text-[10px]">{openSections.scenes ? '▼' : '▶'}</span>
                    </button>

                    {openSections.scenes && (
                      <div className="p-5 border-t border-border space-y-8 bg-surface">

                        <div className="p-3 bg-[#faf7f5] border border-border rounded-lg text-[11px] text-[#8a7a6b] italic">
                          <span className="font-bold not-italic">💡 Tip:</span> For accurate temporal comparison, prefer scenes with lower cloud coverage and similar seasonal acquisition conditions.
                        </div>

                        {/* BEFORE Scene */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-gis uppercase tracking-widest flex items-center gap-2">
                              T1 (Before Scene)
                              {cdBeforeSelectedScene && <span className="w-2.5 h-2.5 rounded-full bg-[#228B22]"></span>}
                            </label>
                          </div>

                          {!cdBeforeSelectedScene ? (
                            <div className="p-5 border border-border rounded-xl bg-muted/50">
                              <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">From Date</label>
                                  <input type="date" value={cdBeforeDateFrom} onChange={(e) => setCdBeforeDateFrom(e.target.value)} className="w-full text-[13px] p-2 border border-border rounded-lg" />
                                </div>
                                <div className="flex-1">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">To Date</label>
                                  <input type="date" value={cdBeforeDateTo} onChange={(e) => setCdBeforeDateTo(e.target.value)} className="w-full text-[13px] p-2 border border-border rounded-lg" />
                                </div>
                                <div className="w-24">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">Max Cloud%</label>
                                  <input type="number" value={cdBeforeMaxCloud} onChange={(e) => setCdBeforeMaxCloud(Number(e.target.value))} className="w-full text-[13px] p-2 border border-border rounded-lg" />
                                </div>
                              </div>

                              <button
                                onClick={() => searchScenes('before')}
                                disabled={isCdBeforePrepLoading}
                                className="w-full py-2.5 px-4 bg-surface border border-border text-gis text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#faf7f5] transition-colors disabled:opacity-50 shadow-sm"
                              >
                                {isCdBeforePrepLoading ? 'Searching Copernicus STAC...' : 'Search T1 Scenes'}
                              </button>

                              {cdBeforeSearchError && (
                                <div className="mt-3 p-3 bg-[#F8DED4]/50 border border-[#F8DED4] text-gis text-[11px] rounded-lg font-medium">
                                  {cdBeforeSearchError}
                                </div>
                              )}

                              {cdBeforePrepResult && cdBeforePrepResult.scenes && cdBeforePrepResult.scenes.length > 0 && (
                                <div className="mt-4 border border-border rounded-lg overflow-hidden bg-surface shadow-sm">
                                  <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-[#faf7f5] sticky top-0 border-b border-border z-10">
                                        <tr>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Acquisition Date</th>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Cloud</th>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Tile</th>
                                          <th className="p-3 text-right"></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {cdBeforePrepResult.scenes.map((scene: any) => (
                                          <tr key={scene.id} className="border-b border-border hover:bg-[#faf7f5]">
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
                                                className="text-[10px] bg-gis-light text-gis px-3 py-1.5 rounded font-bold uppercase tracking-wider hover:bg-gis hover:text-white transition-colors"
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
                                  <span className="font-semibold text-gis">{new Date(cdBeforeSelectedScene.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-text-secondary mb-1 tracking-wider">Cloud Cover</span>
                                  <span className="font-semibold text-gis">{Number(cdBeforeSelectedScene.cloudCoverage).toFixed(2)}%</span>
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
                            <div className="h-4 border-l border-dashed border-border"></div>
                            <div className="bg-surface border border-border px-2 py-0.5 rounded-full text-text-secondary shadow-sm text-[10px] font-bold uppercase tracking-widest">
                              Temporal Shift
                            </div>
                            <div className="h-4 border-l border-dashed border-border"></div>
                          </div>
                        )}

                        {/* AFTER Scene */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-gis uppercase tracking-widest flex items-center gap-2">
                              T2 (After Scene)
                              {cdAfterSelectedScene && <span className="w-2.5 h-2.5 rounded-full bg-[#228B22]"></span>}
                            </label>
                          </div>

                          {!cdAfterSelectedScene ? (
                            <div className="p-5 border border-border rounded-xl bg-muted/50">
                              <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">From Date</label>
                                  <input type="date" value={cdAfterDateFrom} onChange={(e) => setCdAfterDateFrom(e.target.value)} className="w-full text-[13px] p-2 border border-border rounded-lg" />
                                </div>
                                <div className="flex-1">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">To Date</label>
                                  <input type="date" value={cdAfterDateTo} onChange={(e) => setCdAfterDateTo(e.target.value)} className="w-full text-[13px] p-2 border border-border rounded-lg" />
                                </div>
                                <div className="w-24">
                                  <label className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 block">Max Cloud%</label>
                                  <input type="number" value={cdAfterMaxCloud} onChange={(e) => setCdAfterMaxCloud(Number(e.target.value))} className="w-full text-[13px] p-2 border border-border rounded-lg" />
                                </div>
                              </div>

                              <button
                                onClick={() => searchScenes('after')}
                                disabled={isCdAfterPrepLoading}
                                className="w-full py-2.5 px-4 bg-surface border border-border text-gis text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#faf7f5] transition-colors disabled:opacity-50 shadow-sm"
                              >
                                {isCdAfterPrepLoading ? 'Searching Copernicus STAC...' : 'Search T2 Scenes'}
                              </button>

                              {cdAfterSearchError && (
                                <div className="mt-3 p-3 bg-[#F8DED4]/50 border border-[#F8DED4] text-gis text-[11px] rounded-lg font-medium">
                                  {cdAfterSearchError}
                                </div>
                              )}

                              {cdAfterPrepResult && cdAfterPrepResult.scenes && cdAfterPrepResult.scenes.length > 0 && (
                                <div className="mt-4 border border-border rounded-lg overflow-hidden bg-surface shadow-sm">
                                  <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-[#faf7f5] sticky top-0 border-b border-border z-10">
                                        <tr>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Acquisition Date</th>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Cloud</th>
                                          <th className="p-3 font-bold text-text-secondary uppercase text-[9px] tracking-wider">Tile</th>
                                          <th className="p-3 text-right"></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {cdAfterPrepResult.scenes.map((scene: any) => (
                                          <tr key={scene.id} className="border-b border-border hover:bg-[#faf7f5]">
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
                                                className="text-[10px] bg-gis-light text-gis px-3 py-1.5 rounded font-bold uppercase tracking-wider hover:bg-gis hover:text-white transition-colors"
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
                                  <span className="font-semibold text-gis">{new Date(cdAfterSelectedScene.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-text-secondary mb-1 tracking-wider">Cloud Cover</span>
                                  <span className="font-semibold text-gis">{Number(cdAfterSelectedScene.cloudCoverage).toFixed(2)}%</span>
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
                  <div className="bg-surface rounded-xl border border-border shadow-[0_12px_40px_rgba(91,74,62,0.06)] overflow-hidden shrink-0">
                    <button
                      onClick={() => toggleSection('analysis')}
                      className="w-full flex justify-between items-center p-4 bg-muted/30 hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">3. Validate & Process</span>
                        {cdValidationResult?.success && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                      </div>
                      <span className="text-text-secondary font-mono text-[10px]">{openSections.analysis ? '▼' : '▶'}</span>
                    </button>

                    {openSections.analysis && (
                      <div className="p-5 border-t border-border bg-surface">
                        <button
                          onClick={prepareChangeDetectionData}
                          disabled={isCdDownloading || isCdValidating}
                          className="w-full py-3.5 px-4 bg-gis text-white text-[13px] font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm uppercase tracking-wider flex items-center justify-center gap-3"
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
                          <div className="mt-4 p-4 bg-[#F8DED4]/50 border border-[#F8DED4] text-gis text-xs rounded-lg font-medium">
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
                              <div className="bg-surface p-3 rounded-lg shadow-sm border border-emerald-100">
                                <span className="text-emerald-500 text-[9px] font-bold uppercase block mb-1">Grid Dimensions</span>
                                {cdValidationResult.width} × {cdValidationResult.height}
                              </div>
                              <div className="bg-surface p-3 rounded-lg shadow-sm border border-emerald-100">
                                <span className="text-emerald-500 text-[9px] font-bold uppercase block mb-1">CRS</span>
                                {cdValidationResult.crs}
                              </div>
                              <div className="col-span-2 bg-surface p-3 rounded-lg shadow-sm border border-emerald-100">
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
                  <div className="bg-surface rounded-xl border border-border shadow-[0_12px_40px_rgba(91,74,62,0.06)] overflow-hidden shrink-0">
                    <button
                      onClick={() => toggleSection('results')}
                      className="w-full flex justify-between items-center p-4 bg-muted/30 hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">4. Results & Statistics</span>
                        {cdDetectResult?.success && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                      </div>
                      <span className="text-text-secondary font-mono text-[10px]">{openSections.results ? '▼' : '▶'}</span>
                    </button>

                    {openSections.results && (
                      <div className="p-5 border-t border-border bg-surface space-y-6">

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
                          <div className="p-6 bg-surface border border-[#e2d5c8] rounded-xl shadow-[0_4px_20px_rgba(138,122,107,0.06)]">
                            <div className="flex items-center gap-3 text-[#8a7a6b] mb-5 border-b border-border pb-4">
                              <div className="w-8 h-8 rounded-lg bg-[#faf7f5] flex items-center justify-center border border-[#e2d5c8] text-lg">📊</div>
                              <span className="font-bold text-[13px] uppercase tracking-widest text-foreground">Spectral Change Results</span>
                            </div>

                            <div className="grid grid-cols-2 gap-5 mb-6">
                              <div>
                                <div className="text-[10px] uppercase font-bold text-text-secondary mb-1.5 tracking-wider">Valid Pixels</div>
                                <div className="text-[13px] font-mono font-bold text-gis bg-muted p-2.5 rounded-lg border border-border">
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
                                  <div className="bg-muted p-3 rounded-lg border border-border text-center">
                                    <span className="text-[9px] font-bold uppercase text-text-secondary block mb-1">Min</span>
                                    <span className="font-mono text-xs font-bold text-gis">{Number(cdDetectResult.minChange).toFixed(3)}</span>
                                  </div>
                                  <div className="bg-muted p-3 rounded-lg border border-border text-center">
                                    <span className="text-[9px] font-bold uppercase text-text-secondary block mb-1">Mean</span>
                                    <span className="font-mono text-xs font-bold text-gis">{Number(cdDetectResult.meanChange).toFixed(3)}</span>
                                  </div>
                                  <div className="bg-muted p-3 rounded-lg border border-border text-center">
                                    <span className="text-[9px] font-bold uppercase text-text-secondary block mb-1">Max</span>
                                    <span className="font-mono text-xs font-bold text-gis">{Number(cdDetectResult.maxChange).toFixed(3)}</span>
                                  </div>
                                </div>
                                <div className="mt-4 text-[11px] text-text-secondary bg-[#faf7f5] p-3 rounded-lg border border-border leading-relaxed">
                                  Positive values indicate vegetation increase. Negative values indicate vegetation decrease. Cloud and shadow pixels were explicitly set to NaN based on SCL.
                                </div>
                              </div>
                            </div>

                            {/* 6. Classify Change */}
                            <div className="pt-6 border-t border-border">
                              <h4 className="font-bold text-[11px] text-gis uppercase tracking-widest mb-4">Change Map & Area Statistics</h4>
                              <div className="flex flex-col gap-4 mb-5">
                                <div>
                                  <label className="text-[10px] font-bold text-text-secondary uppercase block mb-2 tracking-wider">Threshold (±)</label>
                                  <div className="flex items-center gap-4 bg-muted p-3 rounded-lg border border-border">
                                    <input
                                      type="range"
                                      min="0.05"
                                      max="0.5"
                                      step="0.01"
                                      value={changeThreshold}
                                      onChange={(e) => setChangeThreshold(Number(e.target.value))}
                                      className="w-full accent-primary"
                                    />
                                    <span className="text-[13px] font-mono font-bold text-gis w-12 text-right">{changeThreshold.toFixed(2)}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={classifyChangeMap}
                                  disabled={isClassifyingChange}
                                  className="w-full py-3 px-4 bg-gis text-white text-[11px] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm uppercase tracking-widest flex items-center justify-center gap-2"
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
                                <div className="mt-6 border border-border rounded-xl overflow-hidden shadow-sm bg-muted">
                                  <div className="px-4 py-3 bg-muted border-b border-border flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Categorical Change Map</span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[9px] bg-gis-light text-gis px-2.5 py-1 rounded font-bold uppercase tracking-wider">Threshold: ±{changeClassifyResult.threshold}</span>
                                      <button
                                        onClick={() => setIsFullScreenMapOpen(true)}
                                        className="text-[9px] bg-surface border border-border text-gis px-3 py-1 rounded font-bold uppercase tracking-wider hover:bg-[#faf7f5] hover:border-gis transition-colors shadow-sm flex items-center gap-1"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                                        View Full Screen
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex flex-col xl:flex-row gap-5 p-5">
                                    <div className="flex-1">
                                      <div className="aspect-square w-full bg-surface rounded-xl border border-border overflow-hidden relative flex items-center justify-center p-2 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
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
                                      <div className="p-4 bg-surface border border-border rounded-xl shadow-sm">
                                        <div className="text-[10px] font-bold text-text-secondary uppercase mb-3 tracking-wider">Area Statistics (Valid)</div>
                                        <div className="space-y-3 text-[13px]">
                                          <div className="flex justify-between items-center pb-2 border-b border-border">
                                            <span className="flex items-center gap-2 font-medium text-foreground"><span className="w-2.5 h-2.5 rounded-full bg-[#228B22] shadow-sm"></span> Increase</span>
                                            <span className="font-mono font-bold text-gis">{Number(changeClassifyResult.increaseAreaM2 / 10000).toFixed(2)} ha</span>
                                          </div>
                                          <div className="flex justify-between items-center pb-2 border-b border-border">
                                            <span className="flex items-center gap-2 font-medium text-foreground"><span className="w-2.5 h-2.5 rounded-full bg-[#DC143C] shadow-sm"></span> Decrease</span>
                                            <span className="font-mono font-bold text-gis">{Number(changeClassifyResult.decreaseAreaM2 / 10000).toFixed(2)} ha</span>
                                          </div>
                                          <div className="flex justify-between items-center pb-2 border-b border-border">
                                            <span className="flex items-center gap-2 font-medium text-foreground"><span className="w-2.5 h-2.5 border border-gray-300 rounded-full"></span> Unchanged</span>
                                            <span className="font-mono font-bold text-gis">{Number(changeClassifyResult.unchangedAreaM2 / 10000).toFixed(2)} ha</span>
                                          </div>
                                          <div className="flex justify-between items-center pt-1 font-bold text-gis text-[14px]">
                                            <span>Total Changed</span>
                                            <span className="font-mono">{Number(changeClassifyResult.changedAreaM2 / 10000).toFixed(2)} ha</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="p-4 bg-surface border border-border rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Change Proportion</div>
                                          <div className="text-base font-bold text-gis font-mono">{Number(changeClassifyResult.changedAreaPercent).toFixed(1)}%</div>
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
            </div>
          </>
        )}
            {/* PREDICTION TAB */}
            {activeTab === 'prediction' && (
              <div className="flex flex-col gap-6">
                <div className="bg-surface p-6 rounded-xl border border-border shadow-[0_12px_40px_rgba(91,74,62,0.06)]">
                  <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Land Cover Prediction</h2>
                      <p className="text-xs text-text-secondary mt-1">Predict future urban expansion, agricultural shifts, and forest cover changes based on historical trends.</p>
                    </div>
                    <button
                      onClick={simulatePrediction}
                      disabled={isSimulatingPrediction || !selectedAoi}
                      className="px-6 py-3 bg-indigo-600 text-white text-[13px] font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      {isSimulatingPrediction ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          {predictionStatusMessage || 'Running Prediction...'}
                        </>
                      ) : (
                        'Run Prediction Model'
                      )}
                    </button>
                  </div>

                  {!selectedAoi && (
                    <div className="p-8 text-center text-text-secondary text-sm bg-border/10 rounded-xl border border-dashed border-border">
                      Please draw an Area of Interest (AOI) on the map to begin.
                    </div>
                  )}

                  {selectedPrediction && !isSimulatingPrediction && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            Simulated Result
                          </div>
                          <div className="text-lg font-bold text-indigo-900">{selectedPrediction.title}</div>
                          <div className="text-sm text-indigo-700/80 mt-1">{selectedPrediction.interpretation}</div>
                        </div>
                        <div className="text-right pl-4 border-l border-indigo-200">
                          <div className="text-[10px] uppercase font-bold text-indigo-400">Confidence</div>
                          <div className="text-2xl font-mono font-bold text-indigo-600">{selectedPrediction.confidence}%</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Forecast Period</div>
                          <div className="text-sm font-semibold text-foreground">{selectedPrediction.forecastPeriod}</div>
                        </div>
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Dominant Class</div>
                          <div className="text-sm font-semibold text-foreground">{selectedPrediction.dominantClass}</div>
                        </div>
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Area Change</div>
                          <div className={`text-sm font-semibold ${selectedPrediction.predictedAreaChangeSqKm > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedPrediction.predictedAreaChangeSqKm > 0 ? '+' : ''}{selectedPrediction.predictedAreaChangeSqKm} km²
                          </div>
                        </div>
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Trend</div>
                          <div className="text-sm font-semibold text-foreground capitalize flex items-center gap-2">
                            {selectedPrediction.trend === 'increasing' ? '↗️' : selectedPrediction.trend === 'decreasing' ? '↘️' : '➡️'} {selectedPrediction.trend}
                          </div>
                        </div>
                      </div>

                      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-[11px] font-bold text-gis uppercase tracking-widest mb-6 border-b border-border pb-2">Predicted Land Cover Distribution</h3>
                        <div className="space-y-4">
                          {selectedPrediction.chartData.map(item => (
                            <div key={item.name}>
                              <div className="flex justify-between items-center mb-1 text-xs font-semibold text-foreground">
                                <span>{item.name}</span>
                                <span className="font-mono">{item.value.toFixed(1)}%</span>
                              </div>
                              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RISK & ANOMALY TAB */}
            {activeTab === 'risk' && (
              <div className="flex flex-col gap-6">
                <div className="bg-surface p-6 rounded-xl border border-border shadow-[0_12px_40px_rgba(91,74,62,0.06)]">
                  <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Risk & Anomaly Detection</h2>
                      <p className="text-xs text-text-secondary mt-1">Identify ecological vulnerabilities, unauthorized deforestation, and environmental stress hotspots.</p>
                    </div>
                    <button
                      onClick={simulateRisk}
                      disabled={isSimulatingRisk || !selectedAoi}
                      className="px-6 py-3 bg-red-600 text-white text-[13px] font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      {isSimulatingRisk ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          {riskStatusMessage || 'Analyzing Risks...'}
                        </>
                      ) : (
                        'Run Risk Assessment'
                      )}
                    </button>
                  </div>

                  {!selectedAoi && (
                    <div className="p-8 text-center text-text-secondary text-sm bg-border/10 rounded-xl border border-dashed border-border">
                      Please draw an Area of Interest (AOI) on the map to begin.
                    </div>
                  )}

                  {selectedRisk && !isSimulatingRisk && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className={`border p-4 rounded-xl flex items-center justify-between ${selectedRisk.severityCategory === 'Critical' ? 'bg-red-50 border-red-200' :
                          selectedRisk.severityCategory === 'High' ? 'bg-orange-50 border-orange-200' :
                            selectedRisk.severityCategory === 'Moderate' ? 'bg-yellow-50 border-yellow-200' :
                              'bg-green-50 border-green-200'
                        }`}>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2 text-foreground/70">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Simulated Result
                          </div>
                          <div className="text-lg font-bold text-foreground">{selectedRisk.title}</div>
                          <div className="text-sm text-foreground/80 mt-1">{selectedRisk.interpretation}</div>
                        </div>
                        <div className="text-right pl-4 border-l border-black/10 flex flex-col items-end">
                          <div className="text-[10px] uppercase font-bold text-foreground/50">Overall Risk Score</div>
                          <div className={`text-3xl font-mono font-bold ${selectedRisk.overallRisk > 75 ? 'text-red-600' :
                              selectedRisk.overallRisk > 50 ? 'text-orange-600' :
                                selectedRisk.overallRisk > 25 ? 'text-yellow-600' :
                                  'text-green-600'
                            }`}>{selectedRisk.overallRisk}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Severity Category</div>
                          <div className={`text-sm font-bold ${selectedRisk.severityCategory === 'Critical' ? 'text-red-600' :
                              selectedRisk.severityCategory === 'High' ? 'text-orange-600' :
                                selectedRisk.severityCategory === 'Moderate' ? 'text-yellow-600' :
                                  'text-green-600'
                            }`}>{selectedRisk.severityCategory}</div>
                        </div>
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Dominant Factor</div>
                          <div className="text-sm font-semibold text-foreground">{selectedRisk.dominantRiskFactor}</div>
                        </div>
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Anomaly Score</div>
                          <div className="text-sm font-mono font-bold text-foreground">{selectedRisk.anomalyScore}/100</div>
                        </div>
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Hotspots Found</div>
                          <div className="text-sm font-mono font-bold text-red-600">{selectedRisk.hotspotCount} clusters</div>
                        </div>
                      </div>

                      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-[11px] font-bold text-gis uppercase tracking-widest mb-6 border-b border-border pb-2">Risk Factor Breakdown</h3>
                        <div className="space-y-4">
                          {selectedRisk.chartData.map(item => (
                            <div key={item.name}>
                              <div className="flex justify-between items-center mb-1 text-xs font-semibold text-foreground">
                                <span>{item.name}</span>
                                <span className="font-mono">{item.value}/100</span>
                              </div>
                              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full transition-all duration-1000" style={{ width: `${item.value}%`, backgroundColor: item.fill }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUITABILITY TAB */}
            {activeTab === 'suitability' && (
              <div className="flex flex-col gap-6">
                <div className="bg-surface p-6 rounded-xl border border-border shadow-[0_12px_40px_rgba(91,74,62,0.06)]">
                  <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Land Suitability Analysis</h2>
                      <p className="text-xs text-text-secondary mt-1">Multi-criteria analysis to determine the optimal use of land for agriculture, urban development, and conservation.</p>
                    </div>
                    <button
                      onClick={simulateSuitability}
                      disabled={isSimulatingSuitability || !selectedAoi}
                      className="px-6 py-3 bg-emerald-600 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      {isSimulatingSuitability ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          {suitabilityStatusMessage || 'Running Suitability Analysis...'}
                        </>
                      ) : (
                        'Run Suitability Analysis'
                      )}
                    </button>
                  </div>

                  {!selectedAoi && (
                    <div className="p-8 text-center text-text-secondary text-sm bg-border/10 rounded-xl border border-dashed border-border">
                      Please draw an Area of Interest (AOI) on the map to begin.
                    </div>
                  )}

                  {selectedSuitability && !isSimulatingSuitability && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Simulated Result
                          </div>
                          <div className="text-lg font-bold text-emerald-900">{selectedSuitability.title}</div>
                          <div className="text-sm text-emerald-700/80 mt-1">{selectedSuitability.interpretation}</div>
                        </div>
                        <div className="text-right pl-4 border-l border-emerald-200">
                          <div className="text-[10px] uppercase font-bold text-emerald-600">Suitability Index</div>
                          <div className="text-3xl font-mono font-bold text-emerald-700">{selectedSuitability.overallSuitability}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Recommended Zone</div>
                          <div className="text-sm font-bold text-foreground">{selectedSuitability.recommendedZone}</div>
                        </div>
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Limiting Factor</div>
                          <div className="text-sm font-semibold text-red-600">{selectedSuitability.limitingFactor}</div>
                        </div>
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Suitable Area</div>
                          <div className="text-sm font-mono font-bold text-emerald-600">{selectedSuitability.suitableAreaSqKm} km²</div>
                        </div>
                        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Unsuitable Area</div>
                          <div className="text-sm font-mono font-bold text-red-500">{selectedSuitability.unsuitableAreaSqKm} km²</div>
                        </div>
                      </div>

                      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-[11px] font-bold text-gis uppercase tracking-widest mb-6 border-b border-border pb-2">Suitability Scores by Domain</h3>
                        <div className="space-y-4">
                          {selectedSuitability.chartData.map(item => (
                            <div key={item.subject}>
                              <div className="flex justify-between items-center mb-1 text-xs font-semibold text-foreground">
                                <span>{item.subject}</span>
                                <span className="font-mono">{item.A}/100</span>
                              </div>
                              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${item.A}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
            <div className="flex justify-between items-center p-5 border-b border-[#e2d5c8] bg-surface">
              <h2 id="modal-title" className="text-lg font-bold text-foreground uppercase tracking-widest">Categorical Change Analysis</h2>
              <button
                onClick={() => setIsFullScreenMapOpen(false)}
                className="text-text-secondary hover:text-foreground bg-gis-light px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors border border-transparent hover:border-border"
                aria-label="Close modal"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Map Container - scrolls independently if image is huge, but object-contain is better for fit */}
              <div className="flex-1 bg-surface p-6 flex items-center justify-center relative overflow-auto border-r border-[#e2d5c8]">
                {changeClassifyResult.previewBase64 ? (
                  <img
                    src={`data:image/png;base64,${changeClassifyResult.previewBase64}`}
                    alt="Change Preview Full Screen"
                    className="max-w-full max-h-[70vh] object-contain drop-shadow-xl border border-border rounded-xl"
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
                  <div className="space-y-3 bg-surface p-4 rounded-xl border border-[#e2d5c8] shadow-sm">
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
                  <div className="bg-surface p-4 rounded-xl border border-[#e2d5c8] shadow-sm space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-text-secondary font-medium">Threshold</span>
                      <span className="font-mono font-bold text-gis">±{changeClassifyResult.threshold}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-text-secondary font-medium">Vegetation Increase</span>
                      <span className="font-mono font-bold text-[#228B22]">{Number(changeClassifyResult.increaseAreaM2 / 10000).toFixed(2)} ha</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-text-secondary font-medium">Vegetation Decrease</span>
                      <span className="font-mono font-bold text-[#DC143C]">{Number(changeClassifyResult.decreaseAreaM2 / 10000).toFixed(2)} ha</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-text-secondary font-medium">No Significant Change</span>
                      <span className="font-mono font-bold text-foreground">{Number(changeClassifyResult.unchangedAreaM2 / 10000).toFixed(2)} ha</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-text-secondary font-medium text-xs">Total Changed Area</span>
                      <span className="font-mono font-bold text-gis">{Number(changeClassifyResult.changedAreaM2 / 10000).toFixed(2)} ha</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-text-secondary font-medium text-xs">Changed Area (%)</span>
                      <span className="font-mono font-bold text-gis">{Number(changeClassifyResult.changedAreaPercent).toFixed(2)}%</span>
                    </div>
                    {cdDetectResult && (
                      <>
                        <div className="flex justify-between items-center pb-2 border-b border-border">
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
                  <div className="bg-surface p-4 rounded-xl border border-[#e2d5c8] shadow-sm space-y-2 text-xs">
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
                    <div className="grid grid-cols-3 pt-2 border-t border-border mt-1">
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

