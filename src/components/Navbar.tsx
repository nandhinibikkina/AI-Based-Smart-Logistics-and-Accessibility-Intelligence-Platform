import { useState } from 'react';
import { Menu, X, Truck, ChevronRight } from 'lucide-react';
import type { RouteName } from '@/hooks/useHashRoute';

const links: { label: string; route: RouteName }[] = [
  { label: 'Home', route: 'home' },
  { label: 'Dashboard', route: 'dashboard' },
  { label: 'Route Planner', route: 'route-planner' },
  { label: 'Live Map', route: 'live-map' },
  { label: 'Deliveries', route: 'deliveries' },
  { label: 'Vehicles', route: 'vehicles' },
  { label: 'Analytics', route: 'analytics' },
  { label: 'Alerts', route: 'alerts' },
  { label: 'AI Assistant', route: 'ai-assistant' },
  { label: 'About', route: 'about' },
];

export default function Navbar({ route }: { route: RouteName }) {
  const [open, setOpen] = useState(false);

  const isActive = (r: RouteName) => {
    if (r === 'home') return route === 'home' || route === 'about';
    return route === r;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm">
            <Truck className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            NER-LINK <span className="text-teal-600">AI</span>
          </span>
        </a>

        <ul className="hidden items-center gap-0.5 xl:flex">
          {links.map((l) => (
            <li key={l.route}>
              <a
                href={`#${l.route}`}
                className={`rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                  isActive(l.route)
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden xl:block">
          <a
            href="#route-planner"
            className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            Plan a Route <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 xl:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white xl:hidden">
          <ul className="space-y-1 px-4 py-3">
            {links.map((l) => (
              <li key={l.route}>
                <a
                  href={`#${l.route}`}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                    isActive(l.route)
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#route-planner"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-teal-600 px-4 py-2.5 text-base font-semibold text-white"
              >
                Plan a Route <ChevronRight className="h-4 w-4" />
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
