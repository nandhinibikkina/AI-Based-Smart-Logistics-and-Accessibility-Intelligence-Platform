import {
  Route,
  Accessibility,
  ShieldAlert,
  MapPin,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
}

const features: Feature[] = [
  {
    icon: Route,
    title: 'AI Route Optimization',
    desc: 'Greedy and heuristic models rank every viable path by time, cost and safety — then surface the single best option with alternatives.',
    accent: 'text-teal-600 bg-teal-50',
  },
  {
    icon: Accessibility,
    title: 'Accessibility Intelligence',
    desc: 'Bridge limits, road width, surface type and seasonal closures are factored in so heavy or oversized vehicles never get stuck.',
    accent: 'text-cyan-600 bg-cyan-50',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Monitoring',
    desc: 'Live alerts on landslides, floods, fog and accident zones keep dispatchers ahead of conditions instead of reacting to them.',
    accent: 'text-amber-600 bg-amber-50',
  },
  {
    icon: MapPin,
    title: 'Live Delivery Tracking',
    desc: 'Follow every shipment on an interactive map with ETA updates, delay flags and proof-of-delivery — even across low-connectivity zones.',
    accent: 'text-blue-600 bg-blue-50',
  },
  {
    icon: TrendingUp,
    title: 'AI Predictions',
    desc: 'Forecast delays, demand spikes and route reliability days in advance using historical patterns and live environmental signals.',
    accent: 'text-emerald-600 bg-emerald-50',
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-teal-600">
            Key Features
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built for the realities of NER logistics
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Every feature addresses a specific bottleneck teams face when
            moving goods across the North-Eastern states.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.accent}`}
              >
                <f.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                {f.desc}
              </p>
            </div>
          ))}

          <div className="flex flex-col justify-center rounded-2xl border border-dashed border-teal-300 bg-teal-50/50 p-7 text-center">
            <p className="text-base font-semibold text-teal-800">
              More modules coming soon
            </p>
            <p className="mt-2 text-sm text-teal-700">
              Fleet management, multi-hub scheduling and carbon reporting are on
              the roadmap.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
