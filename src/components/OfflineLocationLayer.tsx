import React, { useEffect, useState } from 'react';
import { GeoJSON, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { mapLocations, type MapLocation } from '@/lib/sampleData';

function makeIcon(color: string, glyph = '', size = 28) {
  const radius = size / 2;
  return L.divIcon({
    className: 'ner-marker',
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;pointer-events:auto;">${glyph}</div>`,
    iconSize: [size, size],
    iconAnchor: [radius, radius],
  });
}

const icons = {
  source: makeIcon('#0d9488', 'S', 30),
  destination: makeIcon('#ef4444', 'D', 30),
  delivery: makeIcon('#0d9488', 'D'),
  vehicle: makeIcon('#2563eb', 'V'),
  warehouse: makeIcon('#7c3aed', 'W'),
  'high-risk': makeIcon('#ef4444', '!'),
  highlight: makeIcon('#f59e0b', '★', 28),
};

interface OfflineLocationLayerProps {
  showBoundaries?: boolean;
  showHighways?: boolean;
  showLocations?: boolean;
  excludeNames?: string[];
}

export default function OfflineLocationLayer({
  showBoundaries = true,
  showHighways = true,
  showLocations = true,
  excludeNames = [],
}: OfflineLocationLayerProps) {
  const [boundariesGeoJson, setBoundariesGeoJson] = useState<any>(null);
  const [highwaysGeoJson, setHighwaysGeoJson] = useState<any>(null);

  useEffect(() => {
    // Fetch state boundaries GeoJSON
    fetch('/maps/geojson/ner-boundaries.json')
      .then((res) => res.json())
      .then((data) => setBoundariesGeoJson(data))
      .catch((e) => console.warn('Could not load local boundaries GeoJSON', e));

    // Fetch highways GeoJSON
    fetch('/maps/geojson/ner-highways.json')
      .then((res) => res.json())
      .then((data) => setHighwaysGeoJson(data))
      .catch((e) => console.warn('Could not load local highways GeoJSON', e));
  }, []);

  return (
    <>
      {/* State Boundaries Polygon Layer */}
      {showBoundaries && boundariesGeoJson && (
        <GeoJSON
          data={boundariesGeoJson}
          style={() => ({
            color: '#0d9488',
            weight: 1.5,
            opacity: 0.6,
            fillColor: '#14b8a6',
            fillOpacity: 0.06,
            dashArray: '4, 4',
          })}
          onEachFeature={(feature, layer) => {
            if (feature.properties && feature.properties.name) {
              layer.bindTooltip(`<b>${feature.properties.name} State</b><br/>Capital: ${feature.properties.capital}`, {
                sticky: true,
                direction: 'top',
                className: 'leaflet-tooltip-ner',
              });
            }
          }}
        />
      )}

      {/* Major Highways & Logistics Corridors Layer */}
      {showHighways && highwaysGeoJson && (
        <GeoJSON
          data={highwaysGeoJson}
          style={(feature) => ({
            color: feature?.properties?.type === 'High-Risk Corridor' ? '#ef4444' : '#3b82f6',
            weight: 3,
            opacity: 0.65,
            dashArray: '5, 5',
          })}
          onEachFeature={(feature, layer) => {
            if (feature.properties) {
              layer.bindPopup(`
                <div style="font-family:sans-serif;font-size:12px;">
                  <strong style="color:#0f766e;">${feature.properties.name}</strong><br/>
                  <span>Distance: ${feature.properties.distanceKm} km</span><br/>
                  <span>Type: ${feature.properties.type}</span>
                </div>
              `);
            }
          }}
        />
      )}

      {/* NER Locations, Warehouses, Risk Nodes & Vehicle Markers */}
      {showLocations &&
        mapLocations
          .filter((loc) => !excludeNames.includes(loc.name))
          .map((loc: MapLocation) => (
            <Marker key={loc.name} position={[loc.lat, loc.lng]} icon={icons[loc.type]}>
              <Popup>
                <div className="text-xs font-sans p-1">
                  <p className="font-bold text-slate-900">{loc.name}</p>
                  <p className="text-slate-600">{loc.label}</p>
                  <span className="mt-1 inline-block rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                    NER Offline Logistics Node
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
    </>
  );
}
