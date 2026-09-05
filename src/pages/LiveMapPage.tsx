import { useMemo, useState, useEffect } from 'react';
import { Map as MapIcon, Navigation, MapPin } from 'lucide-react';
import LiveMap from '@/components/LiveMap';
import { sampleRoutes, mapLocations } from '@/lib/sampleData';
import { useDeliveries } from '@/store/DeliveriesContext';
import Badge from '@/components/Badge';
import { deliveryStatusTone } from '@/lib/sampleData';

const cities = mapLocations.map((l) => l.name);

function getDeliveryIdFromHash(): string | null {
  const hash = window.location.hash.replace(/^#/, '');
  const idx = hash.indexOf('deliveryId=');
  if (idx === -1) return null;
  return decodeURIComponent(hash.slice(idx + 'deliveryId='.length));
}

export default function LiveMapPage() {
  const { deliveries } = useDeliveries();
  const deliveryId = getDeliveryIdFromHash();
  const tracked = useMemo(
    () => (deliveryId ? deliveries.find((d) => d.id === deliveryId) : null),
    [deliveryId, deliveries],
  );

  const [selectedSource, setSelectedSource] = useState<string>('Guwahati');
  const [selectedDestination, setSelectedDestination] = useState<string>('Tawang');

  // Sync state when tracked delivery changes from navigation
  useEffect(() => {
    if (tracked) {
      setSelectedSource(tracked.from);
      setSelectedDestination(tracked.to);
    }
  }, [tracked]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <MapIcon className="h-3.5 w-3.5" />
          Live Map
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          North-East India Logistics Map
        </h1>
        <p className="mt-1.5 max-w-2xl text-base text-slate-600">
          Interactive view of delivery locations, active vehicles, warehouses
          and high-risk zones across the NER corridor network.
        </p>
      </div>

      {tracked && (
        <div className="mt-6 rounded-2xl border-2 border-teal-400 bg-gradient-to-br from-teal-50 to-cyan-50 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Tracking {tracked.id}
            </h2>
            <Badge tone={deliveryStatusTone(tracked.status)}>{tracked.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-700">
            {tracked.from} → {tracked.to} · ETA {tracked.eta} · {tracked.cost} ·{' '}
            {tracked.vehicle}
            {tracked.selectedRoute
              ? ` · Route ${tracked.selectedRoute.name}`
              : ''}
          </p>
        </div>
      )}

      {/* Route Selector controls */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-800">
          <MapPin className="h-4 w-4 text-teal-600" />
          Select Route to Display on Map:
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="map-source" className="block text-xs font-medium text-slate-600 mb-1">
              Source Location
            </label>
            <select
              id="map-source"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="map-destination" className="block text-xs font-medium text-slate-600 mb-1">
              Destination Location
            </label>
            <select
              id="map-destination"
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <LiveMap
          from={selectedSource}
          to={selectedDestination}
          highlightLat={tracked?.lat}
          highlightLng={tracked?.lng}
          highlightLabel={tracked ? `${tracked.id} — ${tracked.from} → ${tracked.to}` : undefined}
          className="h-[560px]"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Warehouses', value: '1', color: 'text-purple-600 bg-purple-50' },
          { label: 'Delivery Points', value: '7', color: 'text-teal-600 bg-teal-50' },
          { label: 'Active Vehicles', value: '2', color: 'text-blue-600 bg-blue-50' },
          { label: 'High-Risk Zones', value: '1', color: 'text-red-600 bg-red-50' },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <MapIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Sample Routes</h2>
        <div className="mt-4 space-y-3">
          {sampleRoutes.map((r) => (
            <div key={r.id} className="flex items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  setSelectedSource(r.from);
                  setSelectedDestination(r.to);
                }}
                className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
              >
                <span
                  className="h-3 w-8 rounded-full"
                  style={{ background: r.color }}
                />
                <span className="font-medium text-slate-800">{r.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
