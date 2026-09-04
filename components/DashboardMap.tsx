"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Warm palette defined by BhooGyan
const COLORS = {
  primary: '#5B4A3E',
  secondary: '#8A8077',
  oat: '#CBBFAF',
  blush: '#F8DED4',
  background: '#F6F2EB',
  white: '#FFFFFF',
};

// Custom icons using the warm palette
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const hotspotIcon = createMarkerIcon(COLORS.primary);
const urbanIcon = createMarkerIcon(COLORS.secondary);

// Demonstration Data
const DEMO_DATA = {
  studyArea: [
    [18.62, 73.7],
    [18.62, 74.0],
    [18.42, 74.0],
    [18.42, 73.7],
  ] as [number, number][],
  agriculturalZones: [
    [
      [18.58, 73.88],
      [18.58, 73.95],
      [18.52, 73.95],
      [18.52, 73.88],
    ] as [number, number][],
    [
      [18.48, 73.75],
      [18.48, 73.82],
      [18.44, 73.82],
      [18.44, 73.75],
    ] as [number, number][],
  ],
  markers: [
    {
      id: 1,
      position: [18.5204, 73.8567] as [number, number],
      title: "Pune Agricultural Conversion Study",
      type: "Research hotspot",
      details: "12 evidence sources",
      icon: hotspotIcon,
    },
    {
      id: 2,
      position: [18.59, 73.75] as [number, number],
      title: "Urban Expansion Zone",
      type: "Illustrative development area",
      details: "High conversion rate",
      icon: urbanIcon,
    },
    {
      id: 3,
      position: [18.46, 73.9] as [number, number],
      title: "Proposed Ring Road Buffer",
      type: "Policy Scenario",
      details: "22% correlation with ag loss",
      icon: hotspotIcon,
    },
  ],
};

export default function DashboardMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full bg-[#F6F2EB] animate-pulse rounded-lg flex items-center justify-center text-[#8A8077] text-sm">Loading map...</div>;
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-[#CBBFAF]">
      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur border border-[#CBBFAF] p-3 rounded shadow-sm text-xs pointer-events-auto">
        <h4 className="font-bold text-[#5B4A3E] mb-2 uppercase tracking-wider text-[10px]">Land Intelligence</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#CBBFAF] opacity-50 border border-[#8A8077]"></div>
            <span className="text-[#8A8077]">Agricultural Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#F8DED4] opacity-40 border border-[#8A8077] border-dashed"></div>
            <span className="text-[#8A8077]">Study Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#5B4A3E] border border-white"></div>
            <span className="text-[#8A8077]">Research Hotspot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#8A8077] border border-white"></div>
            <span className="text-[#8A8077]">Built-up Area</span>
          </div>
        </div>
      </div>

      {/* Label Overlay */}
      <div className="absolute top-2 right-2 z-[400] bg-[#5B4A3E] text-white text-[10px] px-2 py-1 rounded shadow-sm opacity-80 pointer-events-none">
        Illustrative Land Intelligence
      </div>

      <MapContainer 
        center={[18.5204, 73.8567]} 
        zoom={10} 
        style={{ height: '100%', width: '100%', zIndex: 0, backgroundColor: COLORS.background }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-warm"
        />

        {/* Study Area Boundary */}
        <Polygon 
          positions={DEMO_DATA.studyArea} 
          pathOptions={{ 
            color: COLORS.secondary, 
            weight: 2, 
            dashArray: '5, 5',
            fillColor: COLORS.blush,
            fillOpacity: 0.1
          }} 
        />

        {/* Agricultural Zones */}
        {DEMO_DATA.agriculturalZones.map((zone, idx) => (
          <Polygon 
            key={idx}
            positions={zone}
            pathOptions={{
              color: COLORS.secondary,
              weight: 1,
              fillColor: COLORS.oat,
              fillOpacity: 0.3
            }}
          />
        ))}

        {/* Markers */}
        {DEMO_DATA.markers.map(marker => (
          <Marker key={marker.id} position={marker.position} icon={marker.icon}>
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-[#5B4A3E] text-sm mb-1">{marker.title}</h3>
                <p className="text-xs text-[#8A8077] font-medium">{marker.type}</p>
                <p className="text-xs text-[#8A8077] mt-1">{marker.details}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
