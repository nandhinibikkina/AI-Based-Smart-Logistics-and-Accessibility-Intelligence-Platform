import { Route, LayoutDashboard, ShieldCheck, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/8514722/pexels-photo-8514722.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600"
          alt="Winding mountain road through the hills of North-East India"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/85 to-teal-950/80" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-teal-200">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Logistics Platform
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Smart Logistics for
            <span className="block bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
              North-East India
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            NER-LINK AI helps logistics teams choose safer, faster and more
            cost-effective delivery routes across the challenging terrain of the
            North-Eastern region — using real-time risk data, weather insights
            and accessibility intelligence.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#route-planner"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-400 hover:shadow-teal-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Route className="h-5 w-5" />
              Plan a Route
            </a>
            <a
              href="#dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <LayoutDashboard className="h-5 w-5" />
              View Dashboard
            </a>
          </div>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              { icon: ShieldCheck, value: '8', label: 'NER states covered' },
              { icon: Zap, value: 'AI', label: 'Real-time routing' },
              { icon: Route, value: '24/7', label: 'Risk monitoring' },
            ].map((s) => (
              <div key={s.label}>
                <s.icon className="h-5 w-5 text-teal-400" />
                <p className="mt-2 text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs font-medium text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
