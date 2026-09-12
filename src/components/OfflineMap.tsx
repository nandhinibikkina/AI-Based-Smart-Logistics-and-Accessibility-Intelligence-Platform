import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapLocations, type MapLocation, type SampleRoute } from '@/lib/sampleData';
import { useOffline } from '@/lib/offline/OfflineContext';
import { createOfflineTileLayer } from '@/lib/offline/offlineTileLayer';
import OfflineMapStatus from './OfflineMapStatus';
import OfflineRouteLayer from './OfflineRouteLayer';
import OfflineLocationLayer from './OfflineLocationLayer';
import { AlertCircle, Download, WifiOff } from 'lucide-react';

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

const legendItems = [
  { color: '#7c3aed', label: 'Warehouse Hub' },
  { color: '#0d9488', label: 'Delivery Location' },
  { color: '#2563eb', label: 'Vehicle' },
  { color: '#ef4444', label: 'High-Risk Zone' },
  { color: '#3b82f6', label: 'NER Major Highway' },
];

interface OfflineMapProps {
  from?: string;
  to?: string;
  source?: string;
  destination?: string;
  highlightLat?: number;
  highlightLng?: number;
  highlightLabel?: string;
  routes?: SampleRoute[];
  className?: string;
  showAllLocations?: boolean;
  showStatusBanner?: boolean;
}

// Controller to auto-center and adjust map view bounds safely
function MapViewController({
  bounds,
  singlePoint,
  onMapCenterChange,
}: {
  bounds: L.LatLngBounds | null;
  singlePoint: [number, number] | null;
  onMapCenterChange: (center: L.LatLng) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.invalidateSize();

    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 11,
        animate: true,
      });
    } else if (singlePoint) {
      map.setView(singlePoint, 8, { animate: true });
    }

    const handleMove = () => {
      onMapCenterChange(map.getCenter());
    };

    map.on('moveend', handleMove);
    return () => {
      map.off('moveend', handleMove);
    };
  }, [map, bounds, singlePoint, onMapCenterChange]);

  return null;
}

// Offline Tile Layer Component injected into Leaflet MapContainer
function TileLayerAdapter({ isOffline }: { isOffline: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const layer = createOfflineTileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 5,
        attribution: '&copy; OpenStreetMap contributors (Offline Mode Active)',
        isOffline,
      }
    );

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, isOffline]);

  return null;
}

export default function OfflineMap({
  from,
  to,
  source,
  destination,
  highlightLat,
  highlightLng,
  highlightLabel,
  routes = [],
  className = '',
  showAllLocations = false,
  showStatusBanner = true,
}: OfflineMapProps) {
  const { effectiveOffline, offlineMapMode, downloadOfflineData } = useOffline();

  let sourceName = from || source;
  let destName = to || destination;

  if ((!sourceName || !destName) && highlightLabel) {
    const parts = highlightLabel.split('—');
    const routeText = parts[parts.length - 1] || highlightLabel;
    const arrowParts = routeText.split(/→|->/);
    if (arrowParts.length === 2) {
      if (!sourceName) sourceName = arrowParts[0].trim();
      if (!destName) destName = arrowParts[1].trim();
    }
  }

  const sourceLoc = useMemo(() => {
    if (!sourceName) return undefined;
    return mapLocations.find((l) => l.name.toLowerCase() === sourceName?.trim().toLowerCase());
  }, [sourceName]);

  const destLoc = useMemo(() => {
    if (!destName) return undefined;
    return mapLocations.find((l) => l.name.toLowerCase() === destName?.trim().toLowerCase());
  }, [destName]);

  const hasRoute = Boolean(sourceLoc && destLoc);

  const bounds = useMemo(() => {
    if (sourceLoc && destLoc) {
      return L.latLngBounds([
        [sourceLoc.lat, sourceLoc.lng],
        [destLoc.lat, destLoc.lng],
      ]);
    }
    return null;
  }, [sourceLoc, destLoc]);

  const singlePoint = useMemo<[number, number] | null>(() => {
    if (sourceLoc) return [sourceLoc.lat, sourceLoc.lng];
    if (destLoc) return [destLoc.lat, destLoc.lng];
    if (highlightLat !== undefined && highlightLng !== undefined)
      return [highlightLat, highlightLng];
    return null;
  }, [sourceLoc, destLoc, highlightLat, highlightLng]);

  const defaultCenter: [number, number] = [26.0, 92.2];

  // Out of bounds detection for requirement 14
  const [currentCenter, setCurrentCenter] = useState<L.LatLng>(
    L.latLng(defaultCenter[0], defaultCenter[1])
  );

  const isOutOfBounds = useMemo(() => {
    if (!effectiveOffline) return false;
    // NER bounds: lat 21.5 - 29.5, lng 87.5 - 97.5
    const lat = currentCenter.lat;
    const lng = currentCenter.lng;
    return lat < 21.0 || lat > 30.0 || lng < 86.5 || lng > 98.0;
  }, [currentCenter, effectiveOffline]);

  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* Top Status & Controls Bar */}
      {showStatusBanner && (
        <div className="mb-3">
          <OfflineMapStatus />
        </div>
      )}

      <div className="relative flex-1 min-h-[380px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        {/* Out of bounds error banner for Requirement 14 */}
        {isOutOfBounds && (
          <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-2xl border border-amber-300 bg-white/95 p-4 shadow-xl backdrop-blur max-w-md text-center">
            <div className="flex items-center justify-center gap-2 text-amber-700 font-bold text-sm">
              <AlertCircle className="h-5 w-5" />
              Offline Map Data Unavailable
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Offline map data is not available for this region. Please download the required map data while connected to the internet.
            </p>
            <button
              type="button"
              onClick={downloadOfflineData}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              <Download className="h-3.5 w-3.5" />
              Download NER Map Data
            </button>
          </div>
        )}

        <MapContainer
          center={defaultCenter}
          zoom={7}
          scrollWheelZoom
          className="h-full w-full rounded-2xl"
          style={{ minHeight: 380, zIndex: 0 }}
        >
          {/* Custom Offline Tile Layer Adapter */}
          <TileLayerAdapter isOffline={effectiveOffline || offlineMapMode} />

          <MapViewController
            bounds={bounds}
            singlePoint={singlePoint}
            onMapCenterChange={setCurrentCenter}
          />

          {/* GeoJSON State Boundaries & Highway Corridors Layer */}
          <OfflineLocationLayer
            showBoundaries={true}
            showHighways={true}
            showLocations={!hasRoute || showAllLocations}
            excludeNames={[sourceLoc?.name || '', destLoc?.name || '']}
          />

          {/* Detailed Offline Route Visualization */}
          {hasRoute && sourceLoc && destLoc && (
            <OfflineRouteLayer sourceName={sourceLoc.name} destName={destLoc.name} />
          )}

          {/* Tracked highlight marker */}
          {highlightLat !== undefined &&
            highlightLng !== undefined &&
            (!sourceLoc || sourceLoc.lat !== highlightLat || sourceLoc.lng !== highlightLng) &&
            (!destLoc || destLoc.lat !== highlightLat || destLoc.lng !== highlightLng) && (
              <Marker position={[highlightLat, highlightLng]} icon={icons.highlight}>
                <Popup>
                  <div className="text-xs font-sans">
                    <strong className="text-amber-700">Tracked Delivery Location</strong>
                    <br />
                    {highlightLabel}
                  </div>
                </Popup>
              </Marker>
            )}
        </MapContainer>

        {/* Dynamic Map Legend Overlay */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            NER Offline Map Legend
          </p>
          <ul className="space-y-1.5">
            {hasRoute ? (
              <>
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#0d9488]" />
                  <span className="text-xs font-medium text-slate-700">Origin: {sourceLoc?.name}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                  <span className="text-xs font-medium text-slate-700">Destination: {destLoc?.name}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-4 bg-[#0d9488]" />
                  <span className="text-xs font-medium text-slate-700">Offline Active Route</span>
                </li>
              </>
            ) : (
              legendItems.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs font-medium text-slate-700">{item.label}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
