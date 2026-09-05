import { Route, ShieldAlert, Truck, Package, type LucideIcon } from 'lucide-react';

interface Insight {
  icon: LucideIcon;
  title: string;
  text: string;
  accent: string;
}

const insights: Insight[] = [
  {
    icon: Route,
    title: 'Route Insight',
    text: 'Route B provides the best safety-accessibility balance.',
    accent: 'text-teal-600 bg-teal-50',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Insight',
    text: 'Tawang corridor requires additional risk monitoring.',
    accent: 'text-red-600 bg-red-50',
  },
  {
    icon: Truck,
    title: 'Vehicle Insight',
    text: '4x4 vehicles are recommended for difficult terrain.',
    accent: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Package,
    title: 'Delivery Insight',
    text: 'Emergency medical deliveries should prioritize safety and ETA over cost.',
    accent: 'text-amber-600 bg-amber-50',
  },
];

export default function SmartInsights() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
          <Route className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-slate-900">AI Logistics Insights</h2>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {insights.map((i) => (
          <div
            key={i.title}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
          >
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${i.accent}`}>
              <i.icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{i.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{i.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
