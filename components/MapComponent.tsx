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
  // Helper to convert Leaflet GeoJSON (lat,lng) to proper GeoJSON (lng,lat)
  const normalizeCoordinates = (geoJson: any) => {
    if (!geoJson || !geoJson.geometry) return geoJson;
    const { type, coordinates } = geoJson.geometry;
    const swap = (coord: any) => {
      // Recursively swap lat/lng pairs
      if (typeof coord[0] === 'number' && typeof coord[1] === 'number') {
        return [coord[1], coord[0]]; // [lat, lng] => [lng, lat]
      }
      return coord.map(swap);
    };
    let newCoords = coordinates;
    if (type === 'Polygon' || type === 'MultiPolygon') {
      newCoords = swap(coordinates);
    } else if (type === 'Point') {
      newCoords = swap(coordinates);
    } else if (type === 'LineString' || type === 'MultiLineString') {
      newCoords = swap(coordinates);
    }
    return { ...geoJson, geometry: { ...geoJson.geometry, coordinates: newCoords } };
  };

  const _onCreate = (e: any) => {
    const layer = e.layer;
    if (onAoiCreated) {
      const rawGeo = layer.toGeoJSON();
      const normalized = normalizeCoordinates(rawGeo);
      onAoiCreated(normalized);
    }
  };
  // Original _onCreate removed; normalized version above handles AOI creation

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
