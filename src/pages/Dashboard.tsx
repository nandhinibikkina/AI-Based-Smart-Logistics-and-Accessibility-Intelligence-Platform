import {
  Package,
  Truck,
  Clock,
  ShieldAlert,
  Timer,
  IndianRupee,
  MapPin,
  Navigation,
  Route as RouteIcon,
  BarChart3,
  Bell,
  CheckCircle2,
  TrendingUp,
  Bot,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import Badge from '@/components/Badge';
import LiveMap from '@/components/LiveMap';
import SmartInsights from '@/components/SmartInsights';
import { sampleRoutes } from '@/lib/sampleData';
import {
  deliveryStatusTone,
  riskTone,
} from '@/lib/sampleData';
import {
  sampleAlerts,
  severityTone,
} from '@/lib/analyticsData';
import { useDeliveries } from '@/store/DeliveriesContext';

interface RiskRoute {
  name: string;
  level: 'High Risk' | 'Medium Risk' | 'Low Risk';
  score: number;
}

interface Kpi {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
}

const riskRoutes: RiskRoute[] = [
  { name: 'Tawang Corridor', level: 'High Risk', score: 78 },
  { name: 'Imphal–Moreh Corridor', level: 'Medium Risk', score: 52 },
  { name: 'Aizawl Route', level: 'Low Risk', score: 28 },
];

const riskBarColor = (score: number) =>
  score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500';

const states = [
  'Assam',
  'Arunachal Pradesh',
  'Meghalaya',
  'Sikkim',
  'Nagaland',
  'Manipur',
  'Mizoram',
  'Tripura',
];

const quickActions = [
  { label: 'Plan New Route', href: '#route-planner', primary: true, icon: RouteIcon },
  { label: 'Delivery Management', href: '#deliveries', primary: false, icon: Package },
  { label: 'Vehicle Management', href: '#vehicles', primary: false, icon: Truck },
  { label: 'View Live Map', href: '#live-map', primary: false, icon: MapPin },
  { label: 'View Analytics', href: '#analytics', primary: false, icon: BarChart3 },
  { label: 'View All Alerts', href: '#alerts', primary: false, icon: Bell },
  { label: 'Ask AI Assistant', href: '#ai-assistant', primary: false, icon: Bot },
  { label: 'View Predictions', href: '#route-planner', primary: false, icon: Sparkles },
];

const recentAlerts = sampleAlerts.slice(0, 3);

export default function Dashboard() {
  const { deliveries, vehicles } = useDeliveries();
  const activeDeliveries = deliveries.filter((d) => d.status !== 'Delivered').length;
  const availableVehicles = vehicles.filter((v) => v.status !== 'Maintenance').length;
  const inTransit = deliveries.filter((d) => d.status === 'In Transit').length;
  const delayed = deliveries.filter((d) => d.status === 'Delayed').length;
  const highRisk = deliveries.filter((d) => d.risk === 'High').length;

  const kpis: Kpi[] = [
    { icon: Package, label: 'Active Deliveries', value: String(activeDeliveries), accent: 'text-teal-600 bg-teal-50' },
    { icon: Truck, label: 'Available Vehicles', value: String(availableVehicles), accent: 'text-blue-600 bg-blue-50' },
    { icon: Navigation, label: 'In Transit Deliveries', value: String(inTransit), accent: 'text-cyan-600 bg-cyan-50' },
    { icon: Clock, label: 'Delayed Deliveries', value: String(delayed), accent: 'text-amber-600 bg-amber-50' },
    { icon: Timer, label: 'Average ETA', value: '6h 42m', accent: 'text-indigo-600 bg-indigo-50' },
    { icon: IndianRupee, label: 'Cost Savings', value: '₹1.28L', accent: 'text-emerald-600 bg-emerald-50' },
  ];

  const dashboardDeliveries = deliveries.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Logistics Dashboard
        </h1>
        <p className="mt-1.5 text-base text-slate-600">
          Monitor North-East India logistics operations
        </p>
      </div>

      <section aria-label="Key metrics" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${k.accent}`}>
              <k.icon className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{k.value}</p>
              <p className="text-sm font-medium text-slate-500">{k.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Analytics + Alerts preview row */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Analytics Preview */}
        <section aria-label="Analytics preview" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-semibold text-slate-900">Analytics Preview</h2>
            </div>
            <a
              href="#analytics"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              View Analytics <BarChart3 className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-slate-500">Delivery Success Rate</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">89%</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: '89%' }} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-500">Vehicle Utilization</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">78%</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-500" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Recent Alerts */}
        <section aria-label="Recent alerts" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">Recent Alerts</h2>
            </div>
            <a
              href="#alerts"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              View All <Bell className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="mt-4 space-y-3">
            {recentAlerts.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                  <Badge tone={severityTone(a.severity)}>{a.severity}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {a.location} · {a.time}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* AI Predictions + Insights row */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Delay Prediction */}
        <section aria-label="Delay prediction" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Delay Prediction</h2>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900">21%</p>
            <p className="text-sm font-medium text-slate-500">Delay Probability</p>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-amber-500" style={{ width: '21%' }} />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Expected Delay</span>
              <span className="font-semibold text-slate-900">1h 15m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Confidence</span>
              <span className="font-semibold text-teal-600">86%</span>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Based on the current demo conditions, the selected route has a 21% probability of delay.
          </p>
        </section>

        {/* Route Risk Prediction */}
        <section aria-label="Route risk prediction" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-slate-900">Route Risk Prediction</h2>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900">Low</p>
            <p className="text-sm font-medium text-slate-500">Predicted Route Risk</p>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: '22%' }} />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Expected Cost</span>
              <span className="font-semibold text-slate-900">₹7,850</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Alt. Route Benefit</span>
              <span className="font-semibold text-slate-900">28% lower delay risk</span>
            </div>
          </div>
        </section>

        {/* AI Assistant shortcut */}
        <section aria-label="AI assistant shortcut" className="flex flex-col rounded-2xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
              <Bot className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">AI Assistant</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Get instant answers about routes, risks, deliveries and logistics recommendations.
          </p>
          <a
            href="#ai-assistant"
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            <Bot className="h-4 w-4" />
            Ask AI Assistant
          </a>
        </section>
      </div>

      {/* AI Logistics Insights */}
      <div className="mt-8">
        <SmartInsights />
      </div>

      {/* Live Map Preview */}
      <section aria-label="Live map preview" className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">Live Map Preview</h2>
          </div>
          <a
            href="#live-map"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Open full map <MapPin className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Real-time view of active deliveries, vehicles and high-risk zones across the NER.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <LiveMap routes={sampleRoutes} className="h-[360px]" />
        </div>
      </section>

      <section aria-label="Recent deliveries" className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Deliveries</h2>
          <a href="#deliveries" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
            View all
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Delivery ID', 'From', 'To', 'Delivery Type', 'Status', 'ETA', 'Risk'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboardDeliveries.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-900">{d.id}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{d.from}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{d.to}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{d.type}</td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <Badge tone={deliveryStatusTone(d.status)}>{d.status}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{d.eta}</td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <Badge tone={riskTone(d.risk)}>{d.risk}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section aria-label="High risk routes" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900">High Risk Routes</h2>
          <div className="mt-5 space-y-5">
            {riskRoutes.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">{r.name}</p>
                  <span className="text-sm font-semibold text-slate-900">{r.score}/100</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${riskBarColor(r.score)}`}
                    style={{ width: `${r.score}%` }}
                  />
                </div>
                <p className="mt-1.5">
                  <Badge tone={r.level === 'High Risk' ? 'red' : r.level === 'Medium Risk' ? 'amber' : 'green'}>
                    {r.level}
                  </Badge>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="North-East India logistics overview" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            North-East India Logistics Overview
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Coverage spans the eight North-Eastern states, each with distinct terrain and connectivity profiles.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {states.map((s) => (
              <div
                key={s}
                className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-center"
              >
                <p className="text-sm font-semibold text-slate-800">{s}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section aria-label="Quick actions" className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a) => (
            <a
              key={a.label}
              href={a.href}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                a.primary
                  ? 'bg-teal-600 text-white shadow-sm hover:bg-teal-700'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <a.icon className="h-4 w-4" />
              {a.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
