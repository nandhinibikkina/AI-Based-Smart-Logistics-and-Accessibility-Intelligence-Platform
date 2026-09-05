import { useEffect, useState } from 'react';

export type RouteName =
  | 'home'
  | 'dashboard'
  | 'route-planner'
  | 'live-map'
  | 'deliveries'
  | 'vehicles'
  | 'analytics'
  | 'alerts'
  | 'ai-assistant'
  | 'about';

const validRoutes: RouteName[] = [
  'home',
  'dashboard',
  'route-planner',
  'live-map',
  'deliveries',
  'vehicles',
  'analytics',
  'alerts',
  'ai-assistant',
  'about',
];

function parseHash(): RouteName {
  const hash = window.location.hash.replace(/^#/, '').toLowerCase();
  if (validRoutes.includes(hash as RouteName)) return hash as RouteName;
  return 'home';
}

export function useHashRoute(): RouteName {
  const [route, setRoute] = useState<RouteName>(parseHash());

  useEffect(() => {
    const onHash = () => {
      const next = parseHash();
      setRoute(next);
      if (next === 'about') {
        const el = document.getElementById('about');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (next === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return route;
}

export function navigate(route: RouteName): void {
  window.location.hash = route;
}
