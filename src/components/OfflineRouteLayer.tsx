import React, { useMemo } from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { mapLocations, type MapLocation } from '@/lib/sampleData';
import { getLocationAccessibility } from '@/lib/routeEngine';

function makeRouteIcon(color: string, letter: string, size = 30) {
  const radius = size / 2;
  return L.divIcon({
    className: 'offline-route-marker',
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:800;">${letter}</div>`,
    iconSize: [size, size],
    iconAnchor: [radius, radius],
  });
}

function makeWaypointIcon(label: string) {
  return L.divIcon({
    className: 'offline-waypoint-marker',
    html: `<div style="background:#0f766e;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);" title="${label}"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

interface OfflineRouteLayerProps {
  sourceName?: string;
  destName?: string;
}

// Pre-defined intermediate waypoints for key NER highway corridors
const intermediateCorridors: Record<string, { lat: number; lng: number; name: string; info: string }[]> = {
  'Guwahati-Tawang': [
    { lat: 26.6338, lng: 92.8000, name: 'Tezpur Staging Post', info: 'North Bank Logistics Node (Elev: 48m)' },
    { lat: 27.2640, lng: 92.4200, name: 'Bomdila Pass Checkpoint', info: 'High-Altitude Relay Station (Elev: 2,415m)' },
    { lat: 27.5000, lng: 92.1000, name: 'Sela Tunnel / Pass', info: 'High Risk Snow/Landslide Area (Elev: 4,170m)' },
  ],
  'Guwahati-Imphal': [
    { lat: 26.3500, lng: 92.6800, name: 'Nagaon Transit Point', info: 'Flat Corridor Junction' },
    { lat: 25.9060, lng: 93.7270, name: 'Dimapur Railhead', info: 'Commercial Hub Checkpoint' },
    { lat: 25.6751, lng: 94.1086, name: 'Kohima Pass', info: 'Mountain Road Segment' },
  ],
  'Guwahati-Shillong': [
    { lat: 25.9000, lng: 91.8200, name: 'Nongpoh Halt', info: 'Expressway Service Area' },
  ],
  'Guwahati-Gangtok': [
    { lat: 26.5000, lng: 90.5000, name: 'Bongaigaon Hub', info: 'Lower Assam Corridor' },
    { lat: 27.1000, lng: 88.6000, name: 'Rangpo Border Post', info: 'Sikkim Entry Checkpoint' },
  ],
  'Guwahati-Itanagar': [
    { lat: 26.7000, lng: 92.8000, name: 'Tezpur Junction', info: 'Arunachal Entrance' },
    { lat: 26.8500, lng: 93.4000, name: 'Banderdewa Gate', info: 'Border Checkpost' },
  ]
};

export default function OfflineRouteLayer({ sourceName, destName }: OfflineRouteLayerProps) {
  const sourceLoc = useMemo(() => {
    if (!sourceName) return undefined;
    return mapLocations.find((l) => l.name.toLowerCase() === sourceName.trim().toLowerCase());
  }, [sourceName]);

  const destLoc = useMemo(() => {
    if (!destName) return undefined;
    return mapLocations.find((l) => l.name.toLowerCase() === destName.trim().toLowerCase());
  }, [destName]);

  if (!sourceLoc || !destLoc) return null;

  const key = `${sourceLoc.name}-${destLoc.name}`;
  const reverseKey = `${destLoc.name}-${sourceLoc.name}`;
  const waypoints = intermediateCorridors[key] || intermediateCorridors[reverseKey] || [];

  // Construct coordinates path
  const routePoints: [number, number][] = [
    [sourceLoc.lat, sourceLoc.lng],
    ...waypoints.map((w) => [w.lat, w.lng] as [number, number]),
    [destLoc.lat, destLoc.lng],
  ];

  // Calculate distance approximation
  const distanceKm = Math.round(
    Math.hypot(destLoc.lat - sourceLoc.lat, destLoc.lng - sourceLoc.lng) * 111 * 1.4
  );
  const travelHours = Math.floor(distanceKm / 45);
  const travelMins = Math.round((distanceKm % 45) * 1.3);

  const sourceAccess = getLocationAccessibility(sourceLoc.name);
  const destAccess = getLocationAccessibility(destLoc.name);
  const avgAccess = Math.round((sourceAccess.overall + destAccess.overall) / 2);
  const riskLevel = destLoc.name === 'Tawang' || destLoc.name === 'Kohima' ? 'High' : avgAccess < 80 ? 'Medium' : 'Low';

  return (
    <>
      {/* Route Outer Glow Line */}
      <Polyline
        positions={routePoints}
        pathOptions={{
          color: '#14b8a6', // teal 500
          weight: 9,
          opacity: 0.35,
        }}
      />

      {/* Main Dashed Route Line */}
      <Polyline
        positions={routePoints}
        pathOptions={{
          color: '#0d9488', // teal 600
          weight: 5,
          opacity: 0.95,
          dashArray: '8, 8',
        }}
      />

      {/* Source Marker */}
      <Marker position={[sourceLoc.lat, sourceLoc.lng]} icon={makeRouteIcon('#0d9488', 'S', 32)}>
        <Popup>
          <div className="text-xs font-sans p-1">
            <p className="font-bold text-teal-700 text-sm">Origin: {sourceLoc.name}</p>
            <p className="mt-1 text-slate-600">Type: {sourceLoc.label}</p>
            <p className="text-slate-500">Accessibility Score: {sourceAccess.overall}/100</p>
            <p className="text-slate-400 mt-1">Lat: {sourceLoc.lat}, Lng: {sourceLoc.lng}</p>
          </div>
        </Popup>
      </Marker>

      {/* Destination Marker */}
      <Marker position={[destLoc.lat, destLoc.lng]} icon={makeRouteIcon('#ef4444', 'D', 32)}>
        <Popup>
          <div className="text-xs font-sans p-1">
            <p className="font-bold text-red-700 text-sm">Destination: {destLoc.name}</p>
            <p className="mt-1 text-slate-600">Type: {destLoc.label}</p>
            <p className="text-slate-500">Accessibility Score: {destAccess.overall}/100</p>
            <p className="mt-1 font-semibold text-slate-800">
              Corridor Distance: {distanceKm} km
            </p>
            <p className="text-slate-600">
              Est. Time: {travelHours}h {travelMins}m · Risk: <span className="font-bold text-red-600">{riskLevel}</span>
            </p>
          </div>
        </Popup>
      </Marker>

      {/* Intermediate Waypoint Markers */}
      {waypoints.map((wp) => (
        <Marker key={wp.name} position={[wp.lat, wp.lng]} icon={makeWaypointIcon(wp.name)}>
          <Popup>
            <div className="text-xs font-sans p-1">
              <p className="font-bold text-slate-800">{wp.name}</p>
              <p className="text-slate-600 mt-0.5">{wp.info}</p>
              <p className="text-[11px] text-teal-600 mt-1 font-medium">Intermediate Logistics Node</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
