import { useMemo, useState } from 'react';
import {
  Route,
  Sparkles,
  Loader2,
  RotateCcw,
  Star,
  Clock,
  IndianRupee,
  ShieldAlert,
  Accessibility,
  TrendingDown,
  ArrowRight,
  Info,
  CheckCircle2,
  MapPin,
  Package,
  Truck,
  Zap,
  ShieldCheck,
  Scale
} from 'lucide-react';
import Badge from '@/components/Badge';
import ScoreBar from '@/components/ScoreBar';
import Predictions from '@/components/Predictions';
import LiveMap from '@/components/LiveMap';
import {
  analyzeRoute,
  formatCost,
  formatTime,
  riskLevelFromScore,
  type RouteAnalysis,
  type RouteRequest,
  type RouteOption,
  type Priority,
} from '@/lib/routeEngine';
import { mapLocations, type Delivery, type RiskLevel } from '@/lib/sampleData';
import { useDeliveries } from '@/store/DeliveriesContext';
import { navigate } from '@/hooks/useHashRoute';

const cities = [
  'Guwahati',
  'Shillong',
  'Imphal',
  'Tawang',
  'Gangtok',
  'Itanagar',
  'Aizawl',
  'Agartala',
  'Kohima',
  'Dispur',
];

const deliveryTypes = ['Medicine', 'Food', 'Electronics', 'General Goods', 'Medical Supplies', 'Emergency Supplies'];
const vehicleTypes = ['Truck', 'Mini Truck', 'Van', '4x4'];
const priorities: Priority[] = ['Normal', 'High', 'Emergency'];

const fieldClass =
  'mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30';
const labelClass = 'block text-sm font-medium text-slate-700';

const riskBarColor = (score: number) =>
  score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500';

const riskTone = (level: 'Low' | 'Medium' | 'High') =>
  level === 'High' ? 'red' : level === 'Medium' ? 'amber' : 'green';

interface FormState {
  from: string;
  to: string;
  deliveryType: string;
  weight: string;
  vehicle: string;
  priority: Priority;
}

const initialForm: FormState = {
  from: '',
  to: '',
  deliveryType: '',
  weight: '',
  vehicle: '',
  priority: 'Normal',
};

function midpointLat(from: string, to: string): number {
  const a = mapLocations.find((m) => m.name === from);
  const b = mapLocations.find((m) => m.name === to);
  if (!a || !b) return 26.5;
  return (a.lat + b.lat) / 2;
}

function midpointLng(from: string, to: string): number {
  const a = mapLocations.find((m) => m.name === from);
  const b = mapLocations.find((m) => m.name === to);
  if (!a || !b) return 91.8;
  return (a.lng + b.lng) / 2;
}

import { useOffline } from '@/lib/offline/OfflineContext';
import type { Order, TrackingRecord } from '@/lib/sampleData';

function generateIds(existingDeliveries: Delivery[], existingOrders: Order[]) {
  let maxDel = 0;
  existingDeliveries.forEach((d) => {
    const num = parseInt(d.id.replace(/\D/g, ''), 10);
    if (!Number.isNaN(num) && num > maxDel) maxDel = num;
  });
  const nextDelNum = maxDel > 0 ? maxDel + 1 : 1001;
  const deliveryId = `RX-2026-${String(nextDelNum).padStart(4, '0')}`;

  let maxOrd = 0;
  existingOrders.forEach((o) => {
    const num = parseInt(o.id.replace(/\D/g, ''), 10);
    if (!Number.isNaN(num) && num > maxOrd) maxOrd = num;
  });
  const nextOrdNum = maxOrd > 0 ? maxOrd + 1 : 1001;
  const orderId = `ORD-${String(nextOrdNum).padStart(4, '0')}`;
  const trackingId = `TRK-${String(nextOrdNum).padStart(4, '0')}`;

  return { deliveryId, orderId, trackingId };
}

export default function RoutePlanner() {
  const { deliveries, orders, vehicles, createOrderConfirmation, assignVehicleToDelivery } = useDeliveries();
  const { effectiveOffline } = useOffline();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);
  const [selectedRouteOption, setSelectedRouteOption] = useState<RouteOption | null>(null);
  const [error, setError] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreatedOrderId(null);
    setSelectedRouteOption(null);

    if (!form.from || !form.to) {
      setError('Please select both origin and destination.');
      return;
    }
    if (form.from === form.to) {
      setError('Origin and destination cannot be the same location.');
      return;
    }
    if (!form.deliveryType) {
      setError('Please select a delivery type.');
      return;
    }
    if (!form.vehicle) {
      setError('Please select a vehicle type.');
      return;
    }
    const weight = Number(form.weight);
    if (!form.weight || Number.isNaN(weight) || weight <= 0) {
      setError('Please enter a valid cargo weight.');
      return;
    }

    const req: RouteRequest = {
      from: form.from,
      to: form.to,
      deliveryType: form.deliveryType,
      weight,
      vehicle: form.vehicle,
      priority: form.priority,
    };

    setLoading(true);
    setAnalysis(null);
    window.setTimeout(() => {
      try {
        const result = analyzeRoute(req);
        setAnalysis(result);
        const defaultRec = result.routes.find((r) => r.id === result.recommendedId) || result.routes[0];
        setSelectedRouteOption(defaultRec);
      } catch (err: any) {
        setError(err?.message || 'Route data is currently unavailable for this location.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const handleReset = () => {
    setForm(initialForm);
    setAnalysis(null);
    setSelectedRouteOption(null);
    setError('');
    setCreatedOrderId(null);
  };

  const recommended = analysis?.routes.find((r) => r.id === analysis.recommendedId) || analysis?.routes[0];
  const activeRoute = selectedRouteOption || recommended;
  const alternative = analysis?.routes.find((r) => r.id === analysis.alternativeId) || analysis?.routes[1];

  const selectRouteAndCreateDelivery = (route: RouteOption) => {
    try {
      setSelectedRouteOption(route);
      const { deliveryId, orderId, trackingId } = generateIds(deliveries, orders);
      const isOfflineMode = effectiveOffline;

      const order: Order = {
        id: orderId,
        deliveryId,
        routeId: route.id,
        origin: form.from,
        destination: form.to,
        vehicle: form.vehicle,
        cargoType: form.deliveryType,
        weight: `${form.weight} kg`,
        priority: form.priority,
        mode: isOfflineMode ? 'offline' : 'online',
        status: isOfflineMode ? 'Pending Sync' : 'Confirmed',
        trackingStatus: 'Preparing',
        createdAt: new Date().toISOString(),
      };

      const delayProbability = Math.round(route.riskScore * 0.3 + 5);
      const delivery: Delivery = {
        id: deliveryId,
        orderId,
        routeId: route.id,
        from: form.from,
        to: form.to,
        type: form.deliveryType,
        weight: `${form.weight} kg`,
        vehicle: form.vehicle,
        status: 'Planned',
        eta: formatTime(route.timeMinutes),
        risk: route.riskLevel,
        cost: formatCost(route.cost),
        lat: midpointLat(form.from, form.to),
        lng: midpointLng(form.from, form.to),
        priority: form.priority,
        delayProbability,
        createdAt: new Date().toISOString(),
        selectedRoute: {
          id: route.id,
          name: route.name,
          category: route.category,
          distance: route.distanceKm,
          estimatedTime: formatTime(route.timeMinutes),
          estimatedCost: Math.round(route.cost),
          riskScore: route.riskScore,
          riskLevel: route.riskLevel,
          accessibilityScore: route.accessibility,
          delayProbability,
          routeScore: route.routeScore,
        },
      };

      const tracking: TrackingRecord = {
        trackingId,
        orderId,
        deliveryId,
        routeId: route.id,
        status: 'Preparing',
        currentLocation: form.from,
        destination: form.to,
        progress: 0,
        eta: formatTime(route.timeMinutes),
        lastUpdated: new Date().toISOString(),
      };

      createOrderConfirmation(order, delivery, tracking);

      const matchVehicle = vehicles.find(
        (v) => v.type === form.vehicle && v.status === 'Available',
      );
      if (matchVehicle) {
        assignVehicleToDelivery(matchVehicle.id, delivery.id);
      }

      setCreatedOrderId(orderId);

      window.setTimeout(() => {
        document.getElementById('delivery-created')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    } catch (err) {
      setError('Unable to confirm order. Please try again.');
    }
  };

  const createdOrder = useMemo(
    () => (createdOrderId ? orders.find((o) => o.id === createdOrderId) : null),
    [createdOrderId, orders],
  );

  const createdDelivery = useMemo(
    () => (createdOrderId ? deliveries.find((d) => d.orderId === createdOrderId || d.id === createdOrder?.deliveryId) : null),
    [createdOrderId, deliveries, createdOrder],
  );


  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <Route className="h-3.5 w-3.5" />
          AI Route Planner
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          Dynamic Route Planner &amp; Risk Intelligence
        </h1>
        <p className="mt-1.5 max-w-2xl text-base text-slate-600">
          Find the safest, fastest and most cost-effective delivery corridor across North-East India.
        </p>
      </div>

      <form
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="from" className={labelClass}>
              From location (Origin)
            </label>
            <select
              id="from"
              className={fieldClass}
              value={form.from}
              onChange={(e) => update('from', e.target.value)}
            >
              <option value="" disabled>
                Select origin city
              </option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="to" className={labelClass}>
              To location (Destination)
            </label>
            <select
              id="to"
              className={fieldClass}
              value={form.to}
              onChange={(e) => update('to', e.target.value)}
            >
              <option value="" disabled>
                Select destination city
              </option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="deliveryType" className={labelClass}>
              Delivery Cargo Type
            </label>
            <select
              id="deliveryType"
              className={fieldClass}
              value={form.deliveryType}
              onChange={(e) => update('deliveryType', e.target.value)}
            >
              <option value="" disabled>
                Select cargo type
              </option>
              {deliveryTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="weight" className={labelClass}>
              Cargo Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              min={1}
              placeholder="e.g. 250"
              className={fieldClass}
              value={form.weight}
              onChange={(e) => update('weight', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="vehicleType" className={labelClass}>
              Vehicle Type
            </label>
            <select
              id="vehicleType"
              className={fieldClass}
              value={form.vehicle}
              onChange={(e) => update('vehicle', e.target.value)}
            >
              <option value="" disabled>
                Select vehicle type
              </option>
              {vehicleTypes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className={labelClass}>
              Dispatch Priority
            </label>
            <select
              id="priority"
              className={fieldClass}
              value={form.priority}
              onChange={(e) => update('priority', e.target.value as Priority)}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Calculating route alternatives...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Analyze Routes ({form.from || 'Origin'} → {form.to || 'Destination'})
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RotateCcw className="h-5 w-5" />
            Reset
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 border border-red-200">
            {error}
          </p>
        )}
      </form>

      {loading && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
          <p className="mt-4 text-base font-medium text-slate-700">
            Analyzing optimal corridors for {form.from} → {form.to}...
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Evaluating safety, terrain accessibility, travel time and cost metrics.
          </p>
        </div>
      )}

      {analysis && !loading && activeRoute && (
        <div className="mt-8 space-y-8">
          {/* Interactive Route Map Preview */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Interactive Route Map: {form.from} → {form.to}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200">
                Active View: {activeRoute.name}
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <LiveMap from={form.from} to={form.to} className="h-[400px]" />
            </div>
          </section>

          {/* 3 DYNAMIC ROUTE OPTIONS CARDS */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                3 Route Recommendations ({form.from} → {form.to})
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Click any route card to view on map and create delivery record.
              </p>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-3">
              {analysis.routes.map((r) => {
                const isSelected = activeRoute.id === r.id;
                const isRec = r.id === analysis.recommendedId;

                const categoryIcon =
                  r.category === 'Fastest' ? (
                    <Zap className="h-4 w-4 text-amber-500" />
                  ) : r.category === 'Safest' ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Scale className="h-4 w-4 text-blue-500" />
                  );

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRouteOption(r)}
                    className={`flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-teal-500 bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                          {categoryIcon}
                          {r.category.toUpperCase()}
                        </span>
                        {isRec && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-100/80 px-2 py-0.5 rounded-full">
                            <Star className="h-3 w-3 fill-teal-600" /> AI Pick
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-base font-bold text-slate-900">{r.name}</h3>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <span className="text-slate-500">Route Score</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {r.routeScore}/100
                        </span>
                      </div>

                      <dl className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <dt className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <MapPin className="h-3.5 w-3.5" /> Distance
                          </dt>
                          <dd className="font-semibold text-slate-900 text-xs">
                            {r.distanceKm} km
                          </dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <Clock className="h-3.5 w-3.5" /> Est. Time
                          </dt>
                          <dd className="font-semibold text-slate-900 text-xs">
                            {formatTime(r.timeMinutes)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <IndianRupee className="h-3.5 w-3.5" /> Est. Cost
                          </dt>
                          <dd className="font-semibold text-slate-900 text-xs">
                            {formatCost(r.cost)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <ShieldAlert className="h-3.5 w-3.5" /> Risk Score
                          </dt>
                          <dd className="flex items-center gap-1.5 text-xs">
                            <span className="font-semibold text-slate-900">{r.riskScore}/100</span>
                            <Badge tone={riskTone(r.riskLevel)}>{r.riskLevel}</Badge>
                          </dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <Accessibility className="h-3.5 w-3.5" /> Accessibility
                          </dt>
                          <dd className="font-semibold text-slate-900 text-xs">
                            {r.accessibility}/100
                          </dd>
                        </div>
                      </dl>

                      <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600">
                        {r.explanation}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectRouteAndCreateDelivery(r);
                      }}
                      className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-sm hover:bg-teal-700'
                          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Package className="h-4 w-4" /> Select &amp; Create Delivery
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* AI Recommended Route Card Summary */}
          <section className="overflow-hidden rounded-2xl border-2 border-teal-400 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-sm">
            <div className="flex items-center justify-between border-b border-teal-200 bg-white/60 px-6 py-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-teal-500 text-teal-500" />
                <h2 className="text-lg font-bold text-slate-900">
                  Selected Route Details: {activeRoute.name}
                </h2>
              </div>
              <Badge tone={riskTone(activeRoute.riskLevel)}>
                Score {activeRoute.routeScore}/100
              </Badge>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm leading-relaxed text-slate-700">
                {activeRoute.explanation}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl bg-white/80 p-4">
                  <span className="text-xs text-slate-500 font-medium">Distance</span>
                  <p className="mt-1 text-xl font-bold text-slate-900">{activeRoute.distanceKm} km</p>
                </div>
                <div className="rounded-xl bg-white/80 p-4">
                  <span className="text-xs text-slate-500 font-medium">Travel Time</span>
                  <p className="mt-1 text-xl font-bold text-slate-900">{formatTime(activeRoute.timeMinutes)}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-4">
                  <span className="text-xs text-slate-500 font-medium">Est. Cost</span>
                  <p className="mt-1 text-xl font-bold text-slate-900">{formatCost(activeRoute.cost)}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-4">
                  <span className="text-xs text-slate-500 font-medium">Risk Score</span>
                  <p className="mt-1 text-xl font-bold text-slate-900">{activeRoute.riskScore}/100</p>
                </div>
                <div className="rounded-xl bg-white/80 p-4">
                  <span className="text-xs text-slate-500 font-medium">Accessibility</span>
                  <p className="mt-1 text-xl font-bold text-slate-900">{activeRoute.accessibility}/100</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => selectRouteAndCreateDelivery(activeRoute)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2"
              >
                <Package className="h-5 w-5" />
                Confirm Selected Route &amp; Add to Deliveries
              </button>
            </div>
          </section>

          {/* Delivery & Order created success notification */}
          {createdOrder && createdDelivery && createdDelivery.selectedRoute && (
            <section
              id="delivery-created"
              className="overflow-hidden rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-md"
            >
              <div className="flex items-center justify-between border-b border-emerald-200 bg-white/80 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Order confirmed successfully!
                    </h2>
                    <p className="text-xs font-medium text-slate-600">
                      Order <span className="font-bold text-slate-900">{createdOrder.id}</span> and Delivery <span className="font-bold text-slate-900">{createdDelivery.id}</span> persisted and ready for tracking.
                    </p>
                  </div>
                </div>
                <Badge tone={createdOrder.mode === 'offline' ? 'amber' : 'green'}>
                  {createdOrder.mode === 'offline' ? 'Offline - Pending Sync' : 'Online Confirmed'}
                </Badge>
              </div>
              <div className="px-6 py-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <SummaryItem label="Order ID" value={createdOrder.id} />
                  <SummaryItem label="Delivery ID" value={createdDelivery.id} />
                  <SummaryItem label="Route Name" value={createdDelivery.selectedRoute.name} />
                  <SummaryItem label="Origin → Destination" value={`${createdOrder.origin} → ${createdOrder.destination}`} />
                  <SummaryItem label="Cargo & Weight" value={`${createdOrder.cargoType} (${createdOrder.weight})`} />
                  <SummaryItem label="Vehicle" value={createdOrder.vehicle} />
                  <SummaryItem label="Priority" value={createdOrder.priority} />
                  <SummaryItem label="Estimated Cost" value={createdDelivery.cost} />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('deliveries')}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                  >
                    <Truck className="h-4 w-4 text-slate-600" />
                    View Order in Deliveries
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`live-map?orderId=${createdOrder.id}`)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-teal-700"
                  >
                    <MapPin className="h-4 w-4" />
                    Track Order Now
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Risk + Accessibility grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Route Risk Analysis */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Corridor Risk Breakdown
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Risk category breakdown for {activeRoute.name}.
              </p>
              <div className="mt-5 space-y-4">
                {analysis.riskCategories.map((c) => (
                  <ScoreBar
                    key={c.name}
                    label={c.name}
                    value={c.score}
                    barColor={riskBarColor(c.score)}
                    suffix="/100"
                  />
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">
                  Overall Risk Score
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    {analysis.overallRisk}/100
                  </span>
                  <Badge tone={riskTone(riskLevelFromScore(analysis.overallRisk))}>
                    {riskLevelFromScore(analysis.overallRisk)}
                  </Badge>
                </div>
              </div>
            </section>

            {/* Accessibility Intelligence */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Accessibility Intelligence
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Location accessibility based on road quality, connectivity, terrain and weather resilience.
              </p>
              <div className="mt-5 space-y-5">
                {analysis.accessibility.map((loc) => (
                  <div key={loc.name}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">
                        {loc.name}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {loc.overall}/100
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-500 transition-all duration-500"
                        style={{ width: `${loc.overall}%` }}
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                      {loc.factors.map((f) => (
                        <div key={f.label} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{f.label}</span>
                          <span className="font-medium text-slate-700">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Alternative Route */}
          {alternative && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Alternative Route Comparison
                </h2>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Selected Route
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {activeRoute.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Risk {activeRoute.riskScore}/100 · Distance {activeRoute.distanceKm} km · ETA {formatTime(activeRoute.timeMinutes)}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                    Alternative Corridor
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {alternative.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Risk {alternative.riskScore}/100 · Distance {alternative.distanceKm} km · ETA {formatTime(alternative.timeMinutes)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-blue-50 p-4">
                <ArrowRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <p className="text-sm leading-relaxed text-blue-900">
                  Alternative {alternative.name} can reduce delay risk by {analysis.delayReductionPct}% compared to the primary corridor.
                </p>
              </div>
            </section>
          )}

          {/* Smart Predictions */}
          <Predictions
            delayProbability={Math.round(activeRoute.riskScore * 0.3 + 5)}
            expectedDelay={`1h ${Math.round(activeRoute.riskScore * 0.6)}m`}
            routeRisk={activeRoute.riskLevel}
            expectedCost={formatCost(activeRoute.cost)}
            altBenefit={`${analysis.delayReductionPct}% lower delay risk`}
            confidence={88}
            explanation={`Based on current NER road terrain and historical corridor telemetry, ${activeRoute.name} has a ${Math.round(activeRoute.riskScore * 0.3 + 5)}% probability of delay.`}
          />
        </div>
      )}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export type { RiskLevel };
