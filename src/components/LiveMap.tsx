import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapLocations, type MapLocation, type SampleRoute } from '@/lib/sampleData';

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
  { color: '#7c3aed', label: 'Warehouse' },
  { color: '#0d9488', label: 'Delivery Location' },
  { color: '#2563eb', label: 'Vehicle' },
  { color: '#ef4444', label: 'High-Risk Location' },
];

interface LiveMapProps {
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
}

// MapViewController handles dynamic centering, bounds fitting, and zoom updates when locations change
function MapViewController({
  bounds,
  singlePoint,
}: {
  bounds: L.LatLngBounds | null;
  singlePoint: [number, number] | null;
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
  }, [map, bounds, singlePoint]);

  return null;
}

export default function LiveMap({
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
}: LiveMapProps) {
  // Resolve source and destination names
  let sourceName = from || source;
  let destName = to || destination;

  // Extract from highlightLabel if provided (e.g., "GHT-1024 — Guwahati → Tawang")
  if ((!sourceName || !destName) && highlightLabel) {
    const parts = highlightLabel.split('—');
    const routeText = parts[parts.length - 1] || highlightLabel;
    const arrowParts = routeText.split(/→|->/);
    if (arrowParts.length === 2) {
      if (!sourceName) sourceName = arrowParts[0].trim();
      if (!destName) destName = arrowParts[1].trim();
    }
  }

  // Look up location coordinates from mapLocations
  const sourceLoc = useMemo(() => {
    if (!sourceName) return undefined;
    return mapLocations.find(
      (l) => l.name.toLowerCase() === sourceName?.trim().toLowerCase()
    );
  }, [sourceName]);

  const destLoc = useMemo(() => {
    if (!destName) return undefined;
    return mapLocations.find(
      (l) => l.name.toLowerCase() === destName?.trim().toLowerCase()
    );
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

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={7}
        scrollWheelZoom
        className="h-full w-full rounded-2xl"
        style={{ minHeight: 380, zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController bounds={bounds} singlePoint={singlePoint} />

        {/* Display selected Source and Destination markers & route */}
        {hasRoute && sourceLoc && destLoc && (
          <>
            {/* Source Marker */}
            <Marker position={[sourceLoc.lat, sourceLoc.lng]} icon={icons.source}>
              <Popup>
                <div className="text-sm font-sans">
                  <span className="font-bold text-teal-700">Source: {sourceLoc.name}</span>
                  <br />
                  <span className="text-xs text-slate-500">
                    Lat: {sourceLoc.lat.toFixed(4)}, Lng: {sourceLoc.lng.toFixed(4)}
                  </span>
                </div>
              </Popup>
            </Marker>

            {/* Destination Marker */}
            <Marker position={[destLoc.lat, destLoc.lng]} icon={icons.destination}>
              <Popup>
                <div className="text-sm font-sans">
                  <span className="font-bold text-red-700">Destination: {destLoc.name}</span>
                  <br />
                  <span className="text-xs text-slate-500">
                    Lat: {destLoc.lat.toFixed(4)}, Lng: {destLoc.lng.toFixed(4)}
                  </span>
                </div>
              </Popup>
            </Marker>

            {/* Route Line connecting Source to Destination */}
            <Polyline
              positions={[
                [sourceLoc.lat, sourceLoc.lng],
                [destLoc.lat, destLoc.lng],
              ]}
              pathOptions={{
                color: '#0d9488',
                weight: 5,
                opacity: 0.85,
                dashArray: '6 8',
              }}
            />
          </>
        )}

        {/* Additional highlight marker if provided (e.g. tracking mid-point or vehicle position) */}
        {highlightLat !== undefined &&
          highlightLng !== undefined &&
          (!sourceLoc || sourceLoc.lat !== highlightLat || sourceLoc.lng !== highlightLng) &&
          (!destLoc || destLoc.lat !== highlightLat || destLoc.lng !== highlightLng) && (
            <Marker position={[highlightLat, highlightLng]} icon={icons.highlight}>
              <Popup>
                <strong>Tracked Location</strong>
                <br />
                {highlightLabel}
              </Popup>
            </Marker>
          )}

        {/* Overview markers (only shown when no active route or when showAllLocations is explicitly true) */}
        {(!hasRoute || showAllLocations) && (
          <>
            {mapLocations
              .filter(
                (loc) =>
                  !hasRoute ||
                  (loc.name !== sourceLoc?.name && loc.name !== destLoc?.name)
              )
              .map((loc: MapLocation) => (
                <Marker key={loc.name} position={[loc.lat, loc.lng]} icon={icons[loc.type]}>
                  <Popup>
                    <strong>{loc.name}</strong>
                    <br />
                    {loc.label}
                  </Popup>
                </Marker>
              ))}

            {routes.map((r) => (
              <Polyline
                key={r.id}
                positions={[
                  [r.fromLat, r.fromLng],
                  [r.toLat, r.toLng],
                ]}
                pathOptions={{ color: r.color, weight: 3, dashArray: '6 8' }}
              />
            ))}
          </>
        )}
      </MapContainer>

      {/* Map Legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Legend
        </p>
        <ul className="space-y-1.5">
          {hasRoute ? (
            <>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#0d9488]" />
                <span className="text-xs font-medium text-slate-700">Source ({sourceLoc?.name})</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                <span className="text-xs font-medium text-slate-700">Destination ({destLoc?.name})</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-4 bg-[#0d9488]" />
                <span className="text-xs font-medium text-slate-700">Active Corridor Route</span>
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
  );
}
