import { useEffect, useState } from 'react';

export type RouteName =
  | 'home'
  | 'dashboard'
  | 'route-planner'
  | 'live-map'
  | 'tracking'
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
  'tracking',
  'deliveries',
  'vehicles',
  'analytics',
  'alerts',
  'ai-assistant',
  'about',
];

function parseHash(): RouteName {
  const hashRaw = window.location.hash.replace(/^#/, '').trim();
  if (!hashRaw) return 'home';
  
  // Extract base route part before '?' or '/'
  const basePart = hashRaw.split('?')[0].split('/')[0].toLowerCase();
  
  if (basePart === 'tracking') return 'live-map';
  if (validRoutes.includes(basePart as RouteName)) return basePart as RouteName;
  
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

export function navigate(route: string): void {
  if (route.startsWith('#')) {
    window.location.hash = route;
  } else if (route.includes('?') || route.includes('/')) {
    window.location.hash = route.startsWith('/') ? route.slice(1) : route;
  } else {
    window.location.hash = route;
  }
}

export function getHashQueryParams(): Record<string, string> {
  const hashRaw = window.location.hash.replace(/^#/, '').trim();
  const params: Record<string, string> = {};

  // Handle path parameters like #tracking/ORD-1001 or #live-map/ORD-1001
  const pathParts = hashRaw.split('?')[0].split('/');
  if (pathParts.length > 1 && pathParts[1]) {
    const segment = decodeURIComponent(pathParts[1]);
    if (segment.startsWith('ORD-')) {
      params.orderId = segment;
    } else if (segment.startsWith('RX-')) {
      params.deliveryId = segment;
    } else {
      params.id = segment;
    }
  }

  // Handle query parameters like #live-map?orderId=ORD-1001&deliveryId=RX-2026-0001
  const queryIndex = hashRaw.indexOf('?');
  if (queryIndex !== -1) {
    const queryString = hashRaw.slice(queryIndex + 1);
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  return params;
}

