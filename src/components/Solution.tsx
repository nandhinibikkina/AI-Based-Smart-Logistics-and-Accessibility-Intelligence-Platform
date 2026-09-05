import { BrainCircuit, ShieldAlert, Accessibility } from 'lucide-react';

const pillars = [
  {
    icon: BrainCircuit,
    title: 'AI-based route optimization',
    desc: 'Our model evaluates distance, elevation, vehicle type and historical delays to recommend the most efficient path for every shipment — balancing time and fuel cost automatically.',
  },
  {
    icon: ShieldAlert,
    title: 'Continuous risk monitoring',
    desc: 'Live feeds on weather, landslides, road closures and accident hotspots are layered onto each route, so dispatchers are alerted the moment a corridor becomes unsafe.',
  },
  {
    icon: Accessibility,
    title: 'Accessibility intelligence',
    desc: 'We map bridge load limits, road width, connectivity blackspots and seasonal passability so routes are chosen based on what a vehicle can actually traverse — not just what the map shows.',
  },
];

export default function Solution() {
  return (
    <section id="solution" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-600">
              Our Solution
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              One intelligent layer over a complex road network
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              NER-LINK AI turns scattered, unreliable logistics data into clear,
              actionable route decisions. Instead of trusting a static map,
              teams get a living recommendation that adapts to ground reality.
            </p>

            <div className="mt-8 space-y-6">
              {pillars.map((p) => (
                <div key={p.title} className="flex gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <p.icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <img
                src="https://images.pexels.com/photos/11087837/pexels-photo-11087837.jpeg?auto=compress&cs=tinysrgb&h=720&w=1080"
                alt="A truck travelling through a mountainous landscape"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg sm:block">
              <p className="text-3xl font-bold text-teal-600">38%</p>
              <p className="mt-1 max-w-[10rem] text-xs font-medium text-slate-500">
                average delivery time saved on pilot corridors
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
