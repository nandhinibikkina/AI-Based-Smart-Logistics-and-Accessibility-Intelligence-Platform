import { Truck, Github, Linkedin, Mail } from 'lucide-react';

const columns = [
  {
    heading: 'Platform',
    links: [
      { label: 'Dashboard', href: '#dashboard' },
      { label: 'Route Planner', href: '#route-planner' },
      { label: 'Live Map', href: '#live-map' },
      { label: 'Analytics', href: '#analytics' },
    ],
  },
  {
    heading: 'Operations',
    links: [
      { label: 'Deliveries', href: '#deliveries' },
      { label: 'Vehicles', href: '#vehicles' },
      { label: 'Alerts', href: '#alerts' },
      { label: 'AI Assistant', href: '#ai-assistant' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Features', href: '#home' },
      { label: 'How It Works', href: '#home' },
      { label: 'Support', href: '#ai-assistant' },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="about" className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="#home" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                <Truck className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                NER-LINK <span className="text-teal-400">AI</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              An AI-powered smart logistics decision-making platform built for
              the unique terrain, weather and connectivity challenges of
              North-East India.
            </p>
            <div className="mt-5 flex gap-3">
              {[Github, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition-colors hover:bg-teal-500 hover:text-white"
                  aria-label="Social link"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold text-white">{col.heading}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-slate-400 transition-colors hover:text-teal-400"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} NER-LINK AI — Smart India Hackathon
            project. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Built for the North-Eastern Region
          </p>
        </div>
      </div>
    </footer>
  );
}
