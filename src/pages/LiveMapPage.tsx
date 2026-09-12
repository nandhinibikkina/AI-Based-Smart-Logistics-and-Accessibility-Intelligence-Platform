import { useMemo, useState, useEffect } from 'react';
import {
  Map as MapIcon,
  Navigation,
  MapPin,
  HardDrive,
  Clock,
  Package,
  Truck,
  ShieldAlert,
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import LiveMap from '@/components/LiveMap';
import OfflineMapManager from '@/components/OfflineMapManager';
import { mapLocations, type TrackingStatus } from '@/lib/sampleData';
import { useDeliveries } from '@/store/DeliveriesContext';
import { useOffline } from '@/lib/offline/OfflineContext';
import { getHashQueryParams, navigate } from '@/hooks/useHashRoute';
import Badge from '@/components/Badge';
import { deliveryStatusTone, riskTone } from '@/lib/sampleData';

const cities = mapLocations.map((l) => l.name);

const trackingSteps: TrackingStatus[] = [
  'Preparing',
  'Dispatched',
  'In Transit',
  'Near Destination',
  'Delivered',
];

function getProgressCoords(from: string, to: string, progress: number): { lat: number; lng: number } {
  const sourceLoc = mapLocations.find((l) => l.name.toLowerCase() === from.toLowerCase());
  const destLoc = mapLocations.find((l) => l.name.toLowerCase() === to.toLowerCase());
  if (!sourceLoc || !destLoc) return { lat: 26.1445, lng: 91.7362 };
  const ratio = Math.max(0, Math.min(1, progress / 100));
  return {
    lat: sourceLoc.lat + (destLoc.lat - sourceLoc.lat) * ratio,
    lng: sourceLoc.lng + (destLoc.lng - sourceLoc.lng) * ratio,
  };
}

export default function LiveMapPage() {
  const { deliveries, orders, trackingRecords, getOrder, getDelivery, getTrackingRecord, updateTrackingStatus } = useDeliveries();
  const { effectiveOffline } = useOffline();

  const [queryParams, setQueryParams] = useState<Record<string, string>>(getHashQueryParams());
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('Guwahati');
  const [selectedDestination, setSelectedDestination] = useState<string>('Tawang');
  const [activeTab, setActiveTab] = useState<'map' | 'offline-manager'>('map');

  // Update query params on hash change
  useEffect(() => {
    const handleHash = () => setQueryParams(getHashQueryParams());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const requestedId = queryParams.orderId || queryParams.deliveryId || queryParams.id;

  // Resolve current active order, delivery, tracking record
  const currentOrder = useMemo(() => {
    if (requestedId) return getOrder(requestedId);
    if (selectedOrderId) return getOrder(selectedOrderId);
    return orders[0] || null;
  }, [requestedId, selectedOrderId, getOrder, orders]);

  const currentDelivery = useMemo(() => {
    if (currentOrder) return getDelivery(currentOrder.deliveryId) || getDelivery(currentOrder.id);
    if (requestedId) return getDelivery(requestedId);
    return deliveries[0] || null;
  }, [currentOrder, requestedId, getDelivery, deliveries]);

  const currentTracking = useMemo(() => {
    if (currentOrder) return getTrackingRecord(currentOrder.id) || getTrackingRecord(currentOrder.deliveryId);
    if (currentDelivery) return getTrackingRecord(currentDelivery.id) || getTrackingRecord(currentDelivery.orderId || '');
    return trackingRecords[0] || null;
  }, [currentOrder, currentDelivery, getTrackingRecord, trackingRecords]);

  // Sync selected source & destination with active delivery route
  useEffect(() => {
    if (currentDelivery) {
      setSelectedSource(currentDelivery.from);
      setSelectedDestination(currentDelivery.to);
    }
  }, [currentDelivery]);

  const trackingProgress = currentTracking?.progress ?? 0;
  const currentStatus = currentTracking?.status || currentOrder?.trackingStatus || 'Preparing';

  const progressCoords = useMemo(() => {
    if (!currentDelivery) return undefined;
    return getProgressCoords(currentDelivery.from, currentDelivery.to, trackingProgress);
  }, [currentDelivery, trackingProgress]);

  const handleStepClick = (status: TrackingStatus) => {
    if (currentOrder) {
      updateTrackingStatus(currentOrder.id, status);
    } else if (currentDelivery) {
      updateTrackingStatus(currentDelivery.id, status);
    }
  };

  const isInvalidRequestedOrder = Boolean(requestedId && !currentDelivery && !currentOrder);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            <MapIcon className="h-3.5 w-3.5" />
            Live Delivery Tracking &amp; Offline Map
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            {currentOrder ? `Order Tracking — ${currentOrder.id}` : 'North-East Logistics Live Tracking'}
          </h1>
          <p className="mt-1.5 max-w-2xl text-base text-slate-600">
            Real-time corridor monitoring, vehicle tracking, route analysis, and status progression across North-East India.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'map'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="h-4 w-4 text-teal-600" />
            Interactive Map
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('offline-manager')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'offline-manager'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="h-4 w-4 text-teal-600" />
            Offline Map Storage
          </button>
        </div>
      </div>

      {/* ERROR SCREEN: Requested Order Not Found */}
      {isInvalidRequestedOrder && (
        <div className="mt-8 rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-8 text-center shadow-sm max-w-2xl mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Tracking Information Unavailable
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            No order or delivery record was found matching ID <span className="font-mono font-bold text-slate-900">"{requestedId}"</span>.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('deliveries')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700"
            >
              <Package className="h-4 w-4" />
              Back to Deliveries
            </button>
            <button
              type="button"
              onClick={() => navigate('route-planner')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Plan New Route
            </button>
          </div>
        </div>
      )}

      {/* Order Dropdown Selection bar */}
      {!isInvalidRequestedOrder && orders.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Search className="h-4 w-4 text-teal-600" />
            <span>Select Order to Track:</span>
          </div>
          <div className="flex-1 max-w-md">
            <select
              value={currentOrder?.id || ''}
              onChange={(e) => {
                setSelectedOrderId(e.target.value);
                navigate(`live-map?orderId=${e.target.value}`);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.origin} → {o.destination} ({o.cargoType}, {o.status})
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {effectiveOffline ? '🔴 Offline Mode' : '🟢 Online Mode'}
          </span>
        </div>
      )}

      {/* TRACKING DASHBOARD & MAP SECTION */}
      {!isInvalidRequestedOrder && currentDelivery && (
        <div className="mt-6 space-y-6">
          {/* Detailed Tracking Overview Card */}
          <div className="overflow-hidden rounded-2xl border-2 border-teal-500 bg-gradient-to-br from-teal-50 via-white to-cyan-50 shadow-md">
            <div className="flex flex-wrap items-center justify-between border-b border-teal-200 bg-white/80 px-6 py-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Order #{currentOrder?.id || currentDelivery.orderId || 'ORD-1001'}
                    </h2>
                    <Badge tone={deliveryStatusTone(currentDelivery.status)}>
                      {currentDelivery.status}
                    </Badge>
                    {currentOrder?.mode && (
                      <Badge tone={currentOrder.mode === 'offline' ? 'amber' : 'green'}>
                        {currentOrder.mode === 'offline' ? 'Offline Mode' : 'Online'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Delivery ID: <span className="font-mono font-bold">{currentDelivery.id}</span> · Route ID: <span className="font-mono font-bold">{currentDelivery.routeId || currentDelivery.selectedRoute?.id || 'route-1'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                  GPS Status: Live GPS unavailable – Demo tracking
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Status Progression Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Live Tracking Progression ({trackingProgress}%)
                  </span>
                  <span className="text-xs font-bold text-teal-700">
                    Status: {currentStatus}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all duration-500"
                    style={{ width: `${trackingProgress}%` }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {trackingSteps.map((step, idx) => {
                    const isPassed = trackingSteps.indexOf(currentStatus) >= idx;
                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() => handleStepClick(step)}
                        className={`rounded-xl border px-3 py-2 text-center text-xs font-bold transition-all ${
                          isPassed
                            ? 'border-teal-500 bg-teal-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {step}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Key Specs Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-200 pt-5">
                <SummaryBox label="Corridor Route" value={`${currentDelivery.from} → ${currentDelivery.to}`} />
                <SummaryBox label="Assigned Vehicle" value={currentDelivery.vehicle} />
                <SummaryBox label="Cargo Type & Weight" value={`${currentDelivery.type} (${currentDelivery.weight})`} />
                <SummaryBox label="Dispatch Priority" value={currentDelivery.priority} />
                <SummaryBox label="Estimated Time (ETA)" value={currentDelivery.eta} />
                <SummaryBox label="Estimated Cost" value={currentDelivery.cost} />
                <SummaryBox
                  label="Corridor Risk Level"
                  value={currentDelivery.selectedRoute?.riskLevel || currentDelivery.risk}
                  badgeTone={riskTone(currentDelivery.selectedRoute?.riskLevel || currentDelivery.risk)}
                />
                <SummaryBox
                  label="Accessibility Score"
                  value={`${currentDelivery.selectedRoute?.accessibilityScore || 85}/100`}
                />
              </div>
            </div>
          </div>

          {/* Interactive Route Map */}
          {activeTab === 'map' && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <MapPin className="h-4 w-4 text-teal-600" />
                  Live Route Map: {currentDelivery.from} → {currentDelivery.to}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {currentDelivery.selectedRoute ? `Route: ${currentDelivery.selectedRoute.name}` : 'Recommended Route'}
                </span>
              </div>
              <LiveMap
                from={currentDelivery.from}
                to={currentDelivery.to}
                highlightLat={progressCoords?.lat ?? currentDelivery.lat}
                highlightLng={progressCoords?.lng ?? currentDelivery.lng}
                highlightLabel={`[${currentStatus}] ${currentOrder?.id || currentDelivery.id} — ${currentDelivery.from} → ${currentDelivery.to}`}
                className="h-[520px]"
              />
            </div>
          )}

          {activeTab === 'offline-manager' && <OfflineMapManager />}
        </div>
      )}
    </div>
  );
}

function SummaryBox({
  label,
  value,
  badgeTone,
}: {
  label: string;
  value: string;
  badgeTone?: 'green' | 'amber' | 'red' | 'blue' | 'slate';
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-sm font-bold text-slate-900">{value}</p>
        {badgeTone && <Badge tone={badgeTone}>{value}</Badge>}
      </div>
    </div>
  );
}
