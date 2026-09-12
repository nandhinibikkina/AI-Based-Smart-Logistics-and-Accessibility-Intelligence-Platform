// Dynamic AI route analysis engine for RouteX AI (NER-LINK AI).
// Generates location-specific, explainable route recommendations for any NER Origin -> Destination pair.

import { mapLocations, type MapLocation } from './sampleData';

export type RouteCategory = 'Fastest' | 'Safest' | 'Balanced';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type Priority = 'Normal' | 'High' | 'Emergency';

export interface RouteOption {
  id: string; // Unique ID e.g. "route-guwahati-tawang-fastest"
  category: RouteCategory;
  name: string;
  distanceKm: number;
  timeMinutes: number;
  cost: number;
  riskScore: number;
  riskLevel: RiskLevel;
  accessibility: number;
  routeScore: number; // Explainable score (0-100)
  explanation: string;
}

export interface RiskCategory {
  name: string;
  score: number;
  level: RiskLevel;
}

export interface AccessibilityFactor {
  label: string;
  value: number;
}

export interface LocationAccessibility {
  name: string;
  overall: number;
  factors: AccessibilityFactor[];
}

export interface RouteAnalysis {
  routes: RouteOption[];
  recommendedId: string;
  recommendationReason: string;
  riskCategories: RiskCategory[];
  overallRisk: number;
  alternativeId: string;
  delayReductionPct: number;
  riskDifference: number;
  accessibility: LocationAccessibility[];
}

export interface RouteRequest {
  from: string;
  to: string;
  deliveryType: string;
  weight: number;
  vehicle: string;
  priority: Priority;
}

// Base accessibility scores per NER city (0-100)
const locationAccessibility: Record<string, number> = {
  Guwahati: 84,
  Dispur: 84,
  Shillong: 88,
  Imphal: 74,
  Tawang: 58,
  Gangtok: 91,
  Itanagar: 76,
  Aizawl: 79,
  Agartala: 82,
  Kohima: 70,
  Dimapur: 86,
  Tezpur: 85,
  Bomdila: 64,
};

// Terrain difficulty score per location (0-100, higher = more mountainous/difficult)
const terrainDifficulty: Record<string, number> = {
  Tawang: 88,
  Bomdila: 75,
  Kohima: 72,
  Gangtok: 68,
  Aizawl: 62,
  Imphal: 52,
  Shillong: 42,
  Itanagar: 38,
  Dimapur: 22,
  Tezpur: 20,
  Agartala: 18,
  Guwahati: 16,
  Dispur: 16,
};

const accessibilityFactorOffsets: { label: string; offset: number }[] = [
  { label: 'Road Quality', offset: 5 },
  { label: 'Connectivity', offset: -8 },
  { label: 'Transport Availability', offset: 3 },
  { label: 'Terrain', offset: -12 },
  { label: 'Weather Resilience', offset: -3 },
  { label: 'Travel Time', offset: 6 },
];

const vehicleRiskMultiplier: Record<string, number> = {
  '4x4': 0.88,
  Van: 1.05,
  'Mini Truck': 1.15,
  Truck: 1.30,
};

const vehicleSpeedMultiplier: Record<string, number> = {
  '4x4': 1.10,
  Van: 1.0,
  'Mini Truck': 0.92,
  Truck: 0.82,
};

const priorityWeights: Record<Priority, { s: number; a: number; t: number; c: number }> = {
  Normal: { s: 0.25, a: 0.25, t: 0.25, c: 0.25 },
  High: { s: 0.30, a: 0.25, t: 0.30, c: 0.15 },
  Emergency: { s: 0.35, a: 0.20, t: 0.35, c: 0.10 },
};

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const round = (v: number) => Math.round(v);

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

export function formatCost(amount: number): string {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(amount))}`;
}

export function getLocationAccessibility(name: string): LocationAccessibility {
  const overall = locationAccessibility[name] ?? 75;
  const factors = accessibilityFactorOffsets.map((f) => ({
    label: f.label,
    value: clamp(round(overall + f.offset)),
  }));
  return { name, overall, factors };
}

// Calculate Haversine distance in km between two NER coordinates
function calculateGeospatialDistance(fromName: string, toName: string): number {
  const locA = mapLocations.find((l) => l.name.toLowerCase() === fromName.toLowerCase());
  const locB = mapLocations.find((l) => l.name.toLowerCase() === toName.toLowerCase());

  if (!locA || !locB) return 250;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(locB.lat - locA.lat);
  const dLng = toRad(locB.lng - locA.lng);
  const lat1 = toRad(locA.lat);
  const lat2 = toRad(locB.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  // Mountain road multiplier for NER terrain (~1.4x straight distance)
  return Math.round(straightKm * 1.4);
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildRiskCategories(
  overallRisk: number,
  difficulty: number,
  destinationAcc: number,
  routeCategory: RouteCategory,
): RiskCategory[] {
  const catBase = [
    { name: 'Weather Risk', base: 25, riskWeight: 0.5, terrainWeight: 0.5, connWeight: 0 },
    { name: 'Road Risk', base: 35, riskWeight: 0.6, terrainWeight: 0.4, connWeight: 0 },
    { name: 'Landslide Risk', base: 18, riskWeight: 0.4, terrainWeight: 0.6, connWeight: 0 },
    { name: 'Flood Risk', base: 20, riskWeight: 0.5, terrainWeight: 0.5, connWeight: 0 },
    { name: 'Connectivity Risk', base: 30, riskWeight: 0.5, terrainWeight: 0, connWeight: 0.5 },
    { name: 'Delay Risk', base: 28, riskWeight: 0.7, terrainWeight: 0.3, connWeight: 0 },
  ];

  const riskRatio = overallRisk / 35;
  const terrainRatio = difficulty / 30;
  const connRatio = (100 - destinationAcc) / 30;

  const bias: Record<RouteCategory, number> = {
    Fastest: 10,
    Safest: -12,
    Balanced: 0,
  };

  return catBase.map((c) => {
    const raw =
      c.base *
      (c.riskWeight * riskRatio +
        c.terrainWeight * terrainRatio +
        c.connWeight * connRatio) +
      bias[routeCategory];
    const score = clamp(round(raw));
    return { name: c.name, score, level: riskLevelFromScore(score) };
  });
}

// Generate dynamic 3-route alternatives for ANY given origin-destination pair
export function analyzeRoute(req: RouteRequest): RouteAnalysis {
  if (!req.from || !req.to) {
    throw new Error('Origin and destination are required.');
  }

  if (req.from.trim().toLowerCase() === req.to.trim().toLowerCase()) {
    throw new Error('Origin and destination cannot be the same location.');
  }

  const baseDistance = calculateGeospatialDistance(req.from, req.to);

  const difficultyFrom = terrainDifficulty[req.from] ?? 30;
  const difficultyTo = terrainDifficulty[req.to] ?? 30;
  const avgTerrain = (difficultyFrom + difficultyTo) / 2;

  const accFrom = locationAccessibility[req.from] ?? 75;
  const accTo = locationAccessibility[req.to] ?? 75;
  const avgAcc = (accFrom + accTo) / 2;

  const vRisk = vehicleRiskMultiplier[req.vehicle] ?? 1.0;
  const vSpeed = vehicleSpeedMultiplier[req.vehicle] ?? 1.0;
  const weightFactor = 1 + ((req.weight - 250) / 1000) * 0.2;

  const fromSlug = slugify(req.from);
  const toSlug = slugify(req.to);

  // 1. FASTEST ROUTE
  const fastestDist = Math.round(baseDistance * 0.95);
  const fastestBaseSpeed = 50 * vSpeed * (1 - avgTerrain * 0.003);
  const fastestTimeMins = Math.round((fastestDist / Math.max(25, fastestBaseSpeed)) * 60 * weightFactor);
  const fastestRisk = clamp(round(avgTerrain * 0.85 * vRisk * weightFactor + 15));
  const fastestAcc = clamp(round(avgAcc * 0.92));
  const fastestCost = Math.round(fastestDist * 18.5 * weightFactor);

  // 2. SAFEST ROUTE
  const safestDist = Math.round(baseDistance * 1.15); // Low-risk valley bypass
  const safestBaseSpeed = 42 * vSpeed * (1 - avgTerrain * 0.002);
  const safestTimeMins = Math.round((safestDist / Math.max(25, safestBaseSpeed)) * 60 * weightFactor);
  const safestRisk = clamp(round(avgTerrain * 0.40 * vRisk + 5));
  const safestAcc = clamp(round(avgAcc * 1.08));
  const safestCost = Math.round(safestDist * 16.0 * weightFactor);

  // 3. BALANCED ROUTE
  const balancedDist = Math.round(baseDistance * 1.05);
  const balancedBaseSpeed = 46 * vSpeed * (1 - avgTerrain * 0.0025);
  const balancedTimeMins = Math.round((balancedDist / Math.max(25, balancedBaseSpeed)) * 60 * weightFactor);
  const balancedRisk = clamp(round(avgTerrain * 0.60 * vRisk + 10));
  const balancedAcc = clamp(round(avgAcc * 1.0));
  const balancedCost = Math.round(balancedDist * 14.2 * weightFactor);

  const times = [fastestTimeMins, safestTimeMins, balancedTimeMins];
  const costs = [fastestCost, safestCost, balancedCost];
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);

  const normTime = (t: number) => (maxTime === minTime ? 100 : 100 * (1 - (t - minTime) / (maxTime - minTime + 0.001)));
  const normCost = (c: number) => (maxCost === minCost ? 100 : 100 * (1 - (c - minCost) / (maxCost - minCost + 0.001)));
  const w = priorityWeights[req.priority];

  const calcScore = (risk: number, acc: number, time: number, cost: number) =>
    round((100 - risk) * w.s + acc * w.a + normTime(time) * w.t + normCost(cost) * w.c);

  const rawRoutes: { category: RouteCategory; name: string; dist: number; time: number; cost: number; risk: number; acc: number }[] = [
    {
      category: 'Fastest',
      name: `Route 1 – Fastest Route (${req.from} → ${req.to} Express)`,
      dist: fastestDist,
      time: fastestTimeMins,
      cost: fastestCost,
      risk: fastestRisk,
      acc: fastestAcc,
    },
    {
      category: 'Safest',
      name: `Route 2 – Safest Corridor (${req.from} → ${req.to} Low-Risk Bypass)`,
      dist: safestDist,
      time: safestTimeMins,
      cost: safestCost,
      risk: safestRisk,
      acc: safestAcc,
    },
    {
      category: 'Balanced',
      name: `Route 3 – Balanced Highway (${req.from} → ${req.to} Regional Link)`,
      dist: balancedDist,
      time: balancedTimeMins,
      cost: balancedCost,
      risk: balancedRisk,
      acc: balancedAcc,
    },
  ];

  const routes: RouteOption[] = rawRoutes.map((r) => {
    const routeScore = calcScore(r.risk, r.acc, r.time, r.cost);
    const riskLevel = riskLevelFromScore(r.risk);
    const id = `route-${fromSlug}-${toSlug}-${slugify(r.category)}`;

    let explanation = '';
    if (r.category === 'Fastest') {
      explanation = `Offers the fastest travel time (${formatTime(r.time)}) via direct express corridor between ${req.from} and ${req.to}.`;
    } else if (r.category === 'Safest') {
      explanation = `Provides the lowest risk score (${r.risk}/100) and highest road stability (${r.acc}/100 accessibility) avoiding high-risk mountain passes.`;
    } else {
      explanation = `Delivers optimal cost-efficiency (${formatCost(r.cost)}) with a balanced profile of safety, accessibility, and travel speed.`;
    }

    return {
      id,
      category: r.category,
      name: r.name,
      distanceKm: r.dist,
      timeMinutes: r.time,
      cost: r.cost,
      riskScore: r.risk,
      riskLevel,
      accessibility: r.acc,
      routeScore,
      explanation,
    };
  });

  // Ranking & Recommendation logic
  const ranked = [...routes].sort((a, b) => b.routeScore - a.routeScore);
  const recommendedId = ranked[0].id;
  const recommended = routes.find((r) => r.id === recommendedId)!;
  const alternativeId = ranked[1].id;
  const alternative = routes.find((r) => r.id === alternativeId)!;

  const reasonClauses: Record<Priority, string> = {
    Emergency: 'it offers the fastest transit time and critical safety reliability for emergency cargo',
    High: 'it balances transit speed, safety score and cost for high-priority logistics',
    Normal: 'it provides the optimal balance of safety score, accessibility, travel time and cost efficiency',
  };
  const recommendationReason = `${recommended.name} is recommended because ${reasonClauses[req.priority]}. Score: ${recommended.routeScore}/100.`;

  const riskCategories = buildRiskCategories(
    recommended.riskScore,
    avgTerrain,
    accTo,
    recommended.category,
  );
  const overallRisk = round(
    riskCategories.reduce((sum, c) => sum + c.score, 0) / riskCategories.length,
  );

  const recDelay = riskCategories.find((c) => c.name === 'Delay Risk')?.score || 25;
  const altDelayCategories = buildRiskCategories(
    alternative.riskScore,
    avgTerrain,
    accTo,
    alternative.category,
  );
  const altDelay = altDelayCategories.find((c) => c.name === 'Delay Risk')?.score || 30;
  const delayReductionPct = recDelay === 0 ? 0 : round(((recDelay - altDelay) / recDelay) * 100);
  const riskDifference = alternative.riskScore - recommended.riskScore;

  const accessibilityNames = Array.from(
    new Set(['Tawang', 'Shillong', 'Gangtok', 'Itanagar', req.from, req.to]),
  );
  const accessibility = accessibilityNames.map(getLocationAccessibility);

  return {
    routes,
    recommendedId,
    recommendationReason,
    riskCategories,
    overallRisk,
    alternativeId,
    delayReductionPct,
    riskDifference,
    accessibility,
  };
}
