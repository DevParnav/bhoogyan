"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix Leaflet's default icon path issues with Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  onAoiCreated?: (geoJson: any) => void;
  onAoiCleared?: () => void;
}

export default function MapComponent({ onAoiCreated, onAoiCleared }: MapComponentProps) {
  const _onCreate = (e: any) => {
    const layer = e.layer;
    if (onAoiCreated) {
      onAoiCreated(layer.toGeoJSON());
    }
  };

  const _onDeleted = () => {
    if (onAoiCleared) {
      onAoiCleared();
    }
  };

  return (
    <MapContainer 
      center={[18.5204, 73.8567]} // Pune coordinates
      zoom={11} 
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FeatureGroup>
        <EditControl
          position="topleft"
          onCreated={_onCreate}
          onDeleted={_onDeleted}
          draw={{
            polyline: false,
            polygon: true,
            rectangle: true,
            circle: false,
            marker: false,
            circlemarker: false,
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}
