import { Mountain, CloudRain, AlertTriangle, WifiOff } from 'lucide-react';

const problems = [
  {
    icon: Mountain,
    title: 'Difficult Terrain',
    desc: 'Steep gradients, narrow passes and landslide-prone hill roads make many routes unsafe or impassable for heavy vehicles.',
  },
  {
    icon: CloudRain,
    title: 'Weather Conditions',
    desc: 'Heavy monsoon rain, fog and flash floods frequently disrupt schedules and close critical highway stretches without warning.',
  },
  {
    icon: AlertTriangle,
    title: 'Road Risks',
    desc: 'Poor surface quality, blind curves and accident blackspots put drivers and cargo at risk on long inter-state hauls.',
  },
  {
    icon: WifiOff,
    title: 'Connectivity Challenges',
    desc: 'Sparse mobile and internet coverage in remote pockets breaks live tracking and leaves dispatchers blind to delays.',
  },
];

export default function Problem() {
  return (
    <section id="problem" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-teal-600">
            The Challenge
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Logistics in the North-East is uniquely hard
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            The eight North-Eastern states depend on a handful of fragile
            corridors. Deliveries that should take a day often take three — and
            not because of distance, but because of conditions no one planned
            for.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
                <p.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
