import {
  PackageCheck,
  Search,
  ShieldAlert,
  Sparkles,
  MapPin,
  type LucideIcon,
} from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const steps: Step[] = [
  {
    icon: PackageCheck,
    title: 'Delivery Request',
    desc: 'Origin, destination, cargo type and vehicle details are entered into the system.',
  },
  {
    icon: Search,
    title: 'Route Analysis',
    desc: 'The engine evaluates all viable corridors against distance, terrain and road quality.',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Assessment',
    desc: 'Live weather, landslide and accident data are layered onto each candidate route.',
  },
  {
    icon: Sparkles,
    title: 'AI Recommendation',
    desc: 'The model ranks routes by safety, speed and cost — then returns the best option.',
  },
  {
    icon: MapPin,
    title: 'Tracking',
    desc: 'The shipment is dispatched and monitored live, with re-routing if conditions change.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-teal-600">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From request to delivery in five steps
          </h2>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6"
            >
              <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow">
                {i + 1}
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
                <s.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
