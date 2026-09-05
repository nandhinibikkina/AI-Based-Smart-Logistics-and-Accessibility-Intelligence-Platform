import {
  BarChart3,
  Package,
  CheckCircle2,
  Clock,
  Timer,
  Truck,
  IndianRupee,
  TrendingUp,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import {
  analyticsKpis,
  deliveriesByState,
  deliveryStatusData,
  avgDeliveryTimeData,
  vehicleUtilizationData,
  routeRiskDistribution,
  delayReasonsData,
  performanceInsights,
} from '@/lib/analyticsData';

const kpiIcons: LucideIcon[] = [Package, CheckCircle2, Clock, Timer, Truck, IndianRupee];
const kpiAccents = [
  'text-teal-600 bg-teal-50',
  'text-emerald-600 bg-emerald-50',
  'text-amber-600 bg-amber-50',
  'text-indigo-600 bg-indigo-50',
  'text-blue-600 bg-blue-50',
  'text-cyan-600 bg-cyan-50',
];

function ChartCard({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Analytics() {
  const maxStateCount = Math.max(...deliveriesByState.map((d) => d.count));
  const maxDelayCount = Math.max(...delayReasonsData.map((d) => d.count));
  const maxHours = Math.max(...avgDeliveryTimeData.map((d) => d.hours));
  const minHours = Math.min(...avgDeliveryTimeData.map((d) => d.hours));
  const totalStatus = deliveryStatusData.reduce((s, d) => s + d.value, 0);
  const totalRisk = routeRiskDistribution.reduce((s, d) => s + d.value, 0);

  // Build a simple SVG line chart for average delivery time
  const chartW = 100;
  const chartH = 100;
  const points = avgDeliveryTimeData
    .map((d, i) => {
      const x = (i / (avgDeliveryTimeData.length - 1)) * chartW;
      const y = chartH - ((d.hours - minHours + 0.5) / (maxHours - minHours + 0.5)) * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <BarChart3 className="h-3.5 w-3.5" />
          Analytics
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          Logistics Analytics
        </h1>
        <p className="mt-1.5 max-w-2xl text-base text-slate-600">
          Performance metrics and trends across the North-East India delivery
          network.
        </p>
      </div>

      {/* Summary cards */}
      <section aria-label="Summary metrics" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {analyticsKpis.map((k, i) => {
          const Icon = kpiIcons[i];
          return (
            <div
              key={k.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpiAccents[i]}`}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{k.value}</p>
              <p className="text-sm font-medium text-slate-500">{k.label}</p>
            </div>
          );
        })}
      </section>

      {/* Charts grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Deliveries by State */}
        <ChartCard title="Deliveries by State" subtitle="Total deliveries dispatched per NER state.">
          <div className="space-y-3">
            {deliveriesByState.map((d) => (
              <div key={d.state}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{d.state}</span>
                  <span className="font-semibold text-slate-900">{d.count}</span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all duration-500"
                    style={{ width: `${(d.count / maxStateCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Delivery Status */}
        <ChartCard title="Delivery Status" subtitle="Breakdown of all deliveries by current status.">
          {/* Stacked bar */}
          <div className="flex h-8 w-full overflow-hidden rounded-lg">
            {deliveryStatusData.map((d) => (
              <div
                key={d.label}
                className={d.color}
                style={{ width: `${(d.value / totalStatus) * 100}%` }}
                title={`${d.label}: ${d.value}`}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {deliveryStatusData.map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${d.color}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{d.value}</p>
                  <p className="text-xs text-slate-500">{d.label}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Average Delivery Time */}
        <ChartCard title="Average Delivery Time" subtitle="Monthly trend in hours per delivery.">
          <div className="flex items-end gap-4">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" className="h-44 flex-1">
              <polyline
                points={points}
                fill="none"
                stroke="#0d9488"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {avgDeliveryTimeData.map((d, i) => {
                const x = (i / (avgDeliveryTimeData.length - 1)) * chartW;
                const y = chartH - ((d.hours - minHours + 0.5) / (maxHours - minHours + 0.5)) * chartH;
                return <circle key={d.month} cx={x} cy={y} r="2" fill="#0d9488" vectorEffect="non-scaling-stroke" />;
              })}
            </svg>
          </div>
          <div className="mt-3 flex justify-between text-xs font-medium text-slate-500">
            {avgDeliveryTimeData.map((d) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </ChartCard>

        {/* Vehicle Utilization */}
        <ChartCard title="Vehicle Utilization" subtitle="Fleet utilization rate by vehicle type.">
          <div className="space-y-4">
            {vehicleUtilizationData.map((v) => (
              <div key={v.type}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{v.type}</span>
                  <span className="font-semibold text-slate-900">{v.value}%</span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${v.color} transition-all duration-500`}
                    style={{ width: `${v.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Route Risk Distribution */}
        <ChartCard title="Route Risk Distribution" subtitle="Share of routes by risk level.">
          {/* Donut approximation using conic-gradient */}
          <div className="flex items-center gap-6">
            <div
              className="relative h-36 w-36 flex-shrink-0 rounded-full"
              style={{
                background: `conic-gradient(#10b981 0 ${routeRiskDistribution[0].value / totalRisk * 360}deg, #f59e0b ${routeRiskDistribution[0].value / totalRisk * 360}deg ${(routeRiskDistribution[0].value + routeRiskDistribution[1].value) / totalRisk * 360}deg, #ef4444 ${(routeRiskDistribution[0].value + routeRiskDistribution[1].value) / totalRisk * 360}deg 360deg)`,
              }}
            >
              <div className="absolute inset-6 flex items-center justify-center rounded-full bg-white">
                <span className="text-sm font-bold text-slate-900">{totalRisk}</span>
              </div>
            </div>
            <div className="space-y-3">
              {routeRiskDistribution.map((r) => (
                <div key={r.level} className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${r.color}`} />
                  <span className="text-sm font-medium text-slate-700">{r.level}</span>
                  <span className="text-sm font-semibold text-slate-900">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Delay Reasons */}
        <ChartCard title="Delay Reasons" subtitle="Root causes for delayed deliveries.">
          <div className="space-y-3">
            {delayReasonsData.map((d) => (
              <div key={d.reason}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{d.reason}</span>
                  <span className="font-semibold text-slate-900">{d.count}</span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${d.color} transition-all duration-500`}
                    style={{ width: `${(d.count / maxDelayCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Logistics Performance Insights */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Logistics Performance Insights
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Key takeaways from the current reporting period.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {performanceInsights.map((p) => (
            <div key={p.label} className="rounded-xl border border-teal-100 bg-white/70 p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-teal-600">
                <TrendingUp className="h-3.5 w-3.5" />
                {p.label}
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">{p.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
