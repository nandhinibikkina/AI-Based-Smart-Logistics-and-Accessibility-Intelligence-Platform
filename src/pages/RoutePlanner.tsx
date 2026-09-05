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

// Estimate distance (km) from lat/lng using haversine, with a terrain multiplier.
function estimateDistance(from: string, to: string): number {
  const a = mapLocations.find((m) => m.name === from);
  const b = mapLocations.find((m) => m.name === to);
  if (!a || !b) return 300;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  // NER mountain roads are ~1.5x straight-line distance
  return Math.round(R * c * 1.5);
}

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

function generateDeliveryId(existing: Delivery[]): string {
  let n = 1030;
  const existingNums = existing
    .map((d) => parseInt(d.id.replace(/\D/g, ''), 10))
    .filter((x) => !Number.isNaN(x));
  if (existingNums.length) n = Math.max(n, Math.max(...existingNums) + 1);
  return `GHT-${n}`;
}

export default function RoutePlanner() {
  const { deliveries, vehicles, addDelivery, assignVehicleToDelivery } = useDeliveries();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);
  const [error, setError] = useState('');
  const [createdDeliveryId, setCreatedDeliveryId] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreatedDeliveryId(null);

    if (!form.from || !form.to) {
      setError('Please select both origin and destination.');
      return;
    }
    if (form.from === form.to) {
      setError('Origin and destination must be different.');
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
      setError('Please enter a valid weight.');
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
      setAnalysis(analyzeRoute(req));
      setLoading(false);
    }, 900);
  };

  const handleReset = () => {
    setForm(initialForm);
    setAnalysis(null);
    setError('');
    setCreatedDeliveryId(null);
  };

  const recommended = analysis?.routes.find((r) => r.id === analysis.recommendedId);
  const alternative = analysis?.routes.find((r) => r.id === analysis.alternativeId);

  const buildDelivery = (route: RouteOption): Delivery => {
    const distance = estimateDistance(form.from, form.to);
    const delayProbability = Math.round(route.riskScore * 0.3 + 5);
    return {
      id: generateDeliveryId(deliveries),
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
        name: route.name.split(' — ')[0],
        distance,
        estimatedTime: formatTime(route.timeMinutes),
        estimatedCost: Math.round(route.cost),
        riskScore: route.riskScore,
        riskLevel: route.riskLevel,
        accessibilityScore: route.accessibility,
        delayProbability,
      },
    };
  };

  const selectRoute = (route: RouteOption) => {
    const delivery = buildDelivery(route);
    addDelivery(delivery);

    // Associate a matching available vehicle if one exists.
    const matchVehicle = vehicles.find(
      (v) => v.type === form.vehicle && v.status === 'Available',
    );
    if (matchVehicle) {
      assignVehicleToDelivery(matchVehicle.id, delivery.id);
    }

    setCreatedDeliveryId(delivery.id);
    // scroll to the success card
    window.setTimeout(() => {
      document.getElementById('delivery-created')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const createdDelivery = useMemo(
    () => (createdDeliveryId ? deliveries.find((d) => d.id === createdDeliveryId) : null),
    [createdDeliveryId, deliveries],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <Route className="h-3.5 w-3.5" />
          Route Planner
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          AI Route Planner
        </h1>
        <p className="mt-1.5 max-w-2xl text-base text-slate-600">
          Find the safest, fastest and most cost-effective delivery route.
        </p>
      </div>

      <form
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="from" className={labelClass}>
              From location
            </label>
            <select
              id="from"
              className={fieldClass}
              value={form.from}
              onChange={(e) => update('from', e.target.value)}
            >
              <option value="" disabled>
                Select origin
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
              To location
            </label>
            <select
              id="to"
              className={fieldClass}
              value={form.to}
              onChange={(e) => update('to', e.target.value)}
            >
              <option value="" disabled>
                Select destination
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
              Delivery Type
            </label>
            <select
              id="deliveryType"
              className={fieldClass}
              value={form.deliveryType}
              onChange={(e) => update('deliveryType', e.target.value)}
            >
              <option value="" disabled>
                Select type
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
              Weight (kg)
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
                Select vehicle
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
              Priority
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
                Analyzing routes...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Analyze Routes
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
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
      </form>

      {loading && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
          <p className="mt-4 text-base font-medium text-slate-700">
            Analyzing routes...
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Evaluating safety, accessibility, time and cost across corridors.
          </p>
        </div>
      )}

      {analysis && !loading && recommended && alternative && (
        <div className="mt-8 space-y-8">
          {/* Interactive Route Map Preview */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Route Map: {form.from} → {form.to}
              </h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <LiveMap from={form.from} to={form.to} className="h-[380px]" />
            </div>
          </section>

          {/* AI Recommended Route */}
          <section className="overflow-hidden rounded-2xl border-2 border-teal-400 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-sm">
            <div className="flex items-center gap-2 border-b border-teal-200 bg-white/60 px-6 py-4">
              <Star className="h-5 w-5 fill-teal-500 text-teal-500" />
              <h2 className="text-lg font-bold text-slate-900">
                AI Recommended Route
              </h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-base font-semibold text-teal-800">
                {recommended.name}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {analysis.recommendationReason}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-white/70 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <ShieldAlert className="h-4 w-4" /> Risk Score
                  </div>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {recommended.riskScore}/100
                  </p>
                  <div className="mt-1.5">
                    <Badge tone={riskTone(recommended.riskLevel)}>
                      {recommended.riskLevel} Risk
                    </Badge>
                  </div>
                </div>
                <div className="rounded-xl bg-white/70 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Accessibility className="h-4 w-4" /> Accessibility
                  </div>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {recommended.accessibility}/100
                  </p>
                </div>
                <div className="rounded-xl bg-white/70 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Clock className="h-4 w-4" /> ETA
                  </div>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatTime(recommended.timeMinutes)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/70 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <IndianRupee className="h-4 w-4" /> Est. Cost
                  </div>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatCost(recommended.cost)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => selectRoute(recommended)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2"
              >
                <Package className="h-5 w-5" />
                Select Route &amp; Create Delivery
              </button>
            </div>
          </section>

          {/* All route options */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Route Options
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Three candidate corridors generated for your shipment. Choose a route to create a delivery.
              </p>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              {analysis.routes.map((r) => {
                const isRec = r.id === analysis.recommendedId;
                return (
                  <div
                    key={r.id}
                    className={`flex flex-col rounded-xl border p-5 transition-shadow ${
                      isRec
                        ? 'border-teal-400 bg-teal-50/40 shadow-sm'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{r.name}</p>
                      {isRec && <Star className="h-4 w-4 fill-teal-500 text-teal-500" />}
                    </div>
                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="h-4 w-4" /> Time
                        </dt>
                        <dd className="font-semibold text-slate-900">
                          {formatTime(r.timeMinutes)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-1.5 text-slate-500">
                          <IndianRupee className="h-4 w-4" /> Cost
                        </dt>
                        <dd className="font-semibold text-slate-900">
                          {formatCost(r.cost)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-1.5 text-slate-500">
                          <ShieldAlert className="h-4 w-4" /> Risk
                        </dt>
                        <dd className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {r.riskScore}/100
                          </span>
                          <Badge tone={riskTone(r.riskLevel)}>{r.riskLevel}</Badge>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-1.5 text-slate-500">
                          <Accessibility className="h-4 w-4" /> Access
                        </dt>
                        <dd className="font-semibold text-slate-900">
                          {r.accessibility}/100
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
                      {r.explanation}
                    </p>
                    <button
                      type="button"
                      onClick={() => selectRoute(r)}
                      className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Package className="h-3.5 w-3.5" /> Select Route
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Risk + Accessibility grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Route Risk Analysis */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Route Risk Analysis
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Category-level risk for the recommended corridor.
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
                How suitable each region is for logistics operations, based on
                road quality, connectivity, terrain and weather resilience.
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
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Alternative Route
              </h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Current Recommended
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {recommended.name}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Risk {recommended.riskScore}/100 · Delay risk{' '}
                  {analysis.riskCategories.find((c) => c.name === 'Delay Risk')?.score}/100
                </p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                  Alternative
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {alternative.name}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Risk {alternative.riskScore}/100 · Delay risk reduction{' '}
                  {analysis.delayReductionPct}%
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-blue-50 p-4">
              <ArrowRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <p className="text-sm leading-relaxed text-blue-900">
                Alternative {alternative.name.split(' — ')[0]} can reduce delay
                risk by {analysis.delayReductionPct}% compared to the
                recommended route. Risk score difference:{' '}
                {analysis.riskDifference > 0 ? '+' : ''}
                {analysis.riskDifference} points.
              </p>
            </div>
          </section>

          {/* AI Decision Summary */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-6 py-4">
              <Sparkles className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-semibold text-slate-900">AI Decision Summary</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SummaryItem label="Recommended Route" value={recommended.name.split(' — ')[0]} />
                <SummaryItem label="Risk" value={`${recommended.riskScore}/100 · ${recommended.riskLevel}`} />
                <SummaryItem label="Accessibility" value={`${recommended.accessibility}/100`} />
                <SummaryItem label="ETA" value={formatTime(recommended.timeMinutes)} />
                <SummaryItem label="Cost" value={formatCost(recommended.cost)} />
                <SummaryItem
                  label="Delay Probability"
                  value={`${Math.round(recommended.riskScore * 0.3 + 5)}%`}
                />
              </div>
              <div className="mt-4 rounded-xl bg-teal-50 p-4">
                <p className="text-sm leading-relaxed text-teal-900">
                  {analysis.recommendationReason} The recommended route has a{' '}
                  {Math.round(recommended.riskScore * 0.3 + 5)}% estimated delay
                  probability, with an alternative that can reduce delay risk by{' '}
                  {analysis.delayReductionPct}%.
                </p>
              </div>
            </div>
          </section>

          {/* Smart Predictions */}
          <Predictions
            delayProbability={Math.round(recommended.riskScore * 0.3 + 5)}
            expectedDelay={`1h ${Math.round(recommended.riskScore * 0.6)}m`}
            routeRisk={recommended.riskLevel}
            expectedCost={formatCost(recommended.cost)}
            altBenefit={`${analysis.delayReductionPct}% lower delay risk`}
            confidence={86}
            explanation={`Based on the current demo conditions, ${recommended.name.split(' — ')[0]} has a ${Math.round(recommended.riskScore * 0.3 + 5)}% probability of delay. Weather, road conditions and connectivity are the primary contributing factors.`}
          />

          {/* Delivery created success */}
          {createdDelivery && createdDelivery.selectedRoute && (
            <section
              id="delivery-created"
              className="overflow-hidden rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-emerald-200 bg-white/60 px-6 py-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Delivery created successfully
                </h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-slate-700">
                  New delivery ID:{' '}
                  <span className="font-bold text-emerald-700">{createdDelivery.id}</span>
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <SummaryItem label="Route" value={createdDelivery.selectedRoute.name} />
                  <SummaryItem label="From" value={createdDelivery.from} />
                  <SummaryItem label="To" value={createdDelivery.to} />
                  <SummaryItem label="ETA" value={createdDelivery.eta} />
                  <SummaryItem label="Cost" value={createdDelivery.cost} />
                  <SummaryItem
                    label="Risk"
                    value={`${createdDelivery.selectedRoute.riskScore}/100 · ${createdDelivery.selectedRoute.riskLevel}`}
                  />
                  <SummaryItem
                    label="Accessibility"
                    value={`${createdDelivery.selectedRoute.accessibilityScore}/100`}
                  />
                  <SummaryItem
                    label="Distance"
                    value={`${createdDelivery.selectedRoute.distance} km`}
                  />
                  <SummaryItem
                    label="Delay Probability"
                    value={`${createdDelivery.selectedRoute.delayProbability}%`}
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`#live-map?deliveryId=${createdDelivery.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
                  >
                    <MapPin className="h-4 w-4" />
                    View Delivery
                  </a>
                  <button
                    type="button"
                    onClick={() => navigate('deliveries')}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Truck className="h-4 w-4" />
                    Go to Deliveries
                  </button>
                </div>
              </div>
            </section>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
            <p className="text-xs leading-relaxed text-slate-500">
              NER-LINK AI is a hackathon prototype. Route values are generated
              from local deterministic models using sample terrain, weather and
              accessibility baselines — not live external data feeds.
            </p>
          </div>
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

// Re-export RiskLevel so this file's imports stay self-contained.
export type { RiskLevel };
