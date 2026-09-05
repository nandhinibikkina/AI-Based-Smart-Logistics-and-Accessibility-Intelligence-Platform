// Local, deterministic route analysis engine for NER-LINK AI.
// No external APIs — all values are computed from the form inputs using
// fixed baselines calibrated to the Guwahati -> Tawang reference case.

export type RouteId = 'A' | 'B' | 'C';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type Priority = 'Normal' | 'High' | 'Emergency';

export interface RouteOption {
  id: RouteId;
  name: string;
  timeMinutes: number;
  cost: number;
  riskScore: number;
  riskLevel: RiskLevel;
  accessibility: number;
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
  recommendedId: RouteId;
  recommendationReason: string;
  riskCategories: RiskCategory[];
  overallRisk: number;
  alternativeId: RouteId;
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

// Base accessibility scores per NER city (0-100). The four values flagged in
// the spec are fixed; the rest are reasonable estimates for the prototype.
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
};

const accessibilityFactorOffsets: { label: string; offset: number }[] = [
  { label: 'Road Quality', offset: 5 },
  { label: 'Connectivity', offset: -8 },
  { label: 'Transport Availability', offset: 3 },
  { label: 'Terrain', offset: -12 },
  { label: 'Weather Resilience', offset: -3 },
  { label: 'Travel Time', offset: 6 },
];

const routeBases: {
  id: RouteId;
  name: string;
  time: number;
  cost: number;
  risk: number;
  acc: number;
}[] = [
  { id: 'A', name: 'Route A — Direct Mountain Pass', time: 400, cost: 8900, risk: 72, acc: 62 },
  { id: 'B', name: 'Route B — Valley Corridor', time: 435, cost: 7850, risk: 22, acc: 86 },
  { id: 'C', name: 'Route C — Lowland Detour', time: 485, cost: 6900, risk: 45, acc: 71 },
];

// Baseline reference: Guwahati (84) -> Tawang (58), 250 kg, 4x4.
const BASE_DIFFICULTY = 29;
const BASE_WEIGHT = 250;

const vehicleRisk: Record<string, number> = {
  '4x4': 1.0,
  Van: 1.05,
  'Mini Truck': 1.12,
  Truck: 1.2,
};

const vehicleAcc: Record<string, number> = {
  '4x4': 1.0,
  Van: 0.98,
  'Mini Truck': 0.95,
  Truck: 0.9,
};

const priorityWeights: Record<Priority, { s: number; a: number; t: number; c: number }> = {
  Normal: { s: 0.25, a: 0.25, t: 0.25, c: 0.25 },
  High: { s: 0.3, a: 0.25, t: 0.3, c: 0.15 },
  Emergency: { s: 0.35, a: 0.2, t: 0.35, c: 0.1 },
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

function routeExplanation(route: RouteOption, req: RouteRequest): string {
  const reasons: string[] = [];
  if (route.riskLevel === 'Low') reasons.push('the lowest risk profile');
  else if (route.riskLevel === 'High') reasons.push('a direct but higher-risk path');
  else reasons.push('a moderate risk profile');

  if (route.accessibility >= 80) reasons.push('strong accessibility');
  else if (route.accessibility < 65) reasons.push('limited accessibility for heavy vehicles');

  if (route.id === 'A') reasons.push(`fastest option for ${req.vehicle.toLowerCase()}s`);
  if (route.id === 'C') reasons.push('most economical corridor');

  return `Offers ${reasons.join(', ')} between ${req.from} and ${req.to}.`;
}

function buildRiskCategories(
  overallRisk: number,
  difficulty: number,
  destinationAcc: number,
  routeId: RouteId,
): RiskCategory[] {
  // Calibrated so the reference case (Route B, risk 22, difficulty 29) yields
  // the spec's example category scores.
  const catBase: { name: string; base: number; riskWeight: number; terrainWeight: number; connWeight: number }[] = [
    { name: 'Weather Risk', base: 25, riskWeight: 0.5, terrainWeight: 0.5, connWeight: 0 },
    { name: 'Road Risk', base: 35, riskWeight: 0.6, terrainWeight: 0.4, connWeight: 0 },
    { name: 'Landslide Risk', base: 18, riskWeight: 0.4, terrainWeight: 0.6, connWeight: 0 },
    { name: 'Flood Risk', base: 20, riskWeight: 0.5, terrainWeight: 0.5, connWeight: 0 },
    { name: 'Connectivity Risk', base: 30, riskWeight: 0.5, terrainWeight: 0, connWeight: 0.5 },
    { name: 'Delay Risk', base: 28, riskWeight: 0.7, terrainWeight: 0.3, connWeight: 0 },
  ];

  const riskRatio = overallRisk / 22;
  const terrainRatio = difficulty / BASE_DIFFICULTY;
  const connRatio = (100 - destinationAcc) / (100 - 58);

  // Small stable per-route adjustment so the three routes differ visibly.
  const routeBias: Record<RouteId, number> = { A: 12, B: 0, C: 6 };

  return catBase.map((c) => {
    const raw =
      c.base *
      (c.riskWeight * riskRatio +
        c.terrainWeight * terrainRatio +
        c.connWeight * connRatio) +
      routeBias[routeId];
    const score = clamp(round(raw));
    return { name: c.name, score, level: riskLevelFromScore(score) };
  });
}

export function analyzeRoute(req: RouteRequest): RouteAnalysis {
  const accFrom = locationAccessibility[req.from] ?? 75;
  const accTo = locationAccessibility[req.to] ?? 75;
  const avgAcc = (accFrom + accTo) / 2;
  const difficulty = 100 - avgAcc;
  const terrainFactor = difficulty / BASE_DIFFICULTY;
  const weightFactor = req.weight / BASE_WEIGHT;
  const vRisk = vehicleRisk[req.vehicle] ?? 1.1;
  const vAcc = vehicleAcc[req.vehicle] ?? 0.95;

  const routes: RouteOption[] = routeBases.map((b) => {
    const timeMinutes = b.time * (0.85 + 0.15 * terrainFactor) * (1 + 0.0006 * (req.weight - BASE_WEIGHT));
    const cost = b.cost * (0.7 + 0.3 * terrainFactor) * (0.5 + 0.5 * weightFactor);
    const riskScore = clamp(
      b.risk * (0.6 + 0.4 * terrainFactor) * vRisk * (1 + 0.0008 * (req.weight - BASE_WEIGHT)),
    );
    const accessibility = clamp(b.acc * (1.1 - 0.1 * terrainFactor) * vAcc);
    const route: RouteOption = {
      id: b.id,
      name: b.name,
      timeMinutes,
      cost,
      riskScore: round(riskScore),
      riskLevel: riskLevelFromScore(riskScore),
      accessibility: round(accessibility),
      explanation: '',
    };
    route.explanation = routeExplanation(route, req);
    return route;
  });

  // Normalised scoring (higher is better) across the three routes.
  const times = routes.map((r) => r.timeMinutes);
  const costs = routes.map((r) => r.cost);
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const cMin = Math.min(...costs);
  const cMax = Math.max(...costs);
  const normTime = (t: number) => (tMax === tMin ? 100 : 100 * (1 - (t - tMin) / (tMax - tMin)));
  const normCost = (c: number) => (cMax === cMin ? 100 : 100 * (1 - (c - cMin) / (cMax - cMin)));
  const w = priorityWeights[req.priority];

  const scores = routes.map((r) => ({
    id: r.id,
    total:
      (100 - r.riskScore) * w.s +
      r.accessibility * w.a +
      normTime(r.timeMinutes) * w.t +
      normCost(r.cost) * w.c,
  }));

  const ranked = [...scores].sort((a, b) => b.total - a.total);
  const recommendedId = ranked[0].id;
  const recommended = routes.find((r) => r.id === recommendedId)!;

  const reasonClauses: Record<Priority, string> = {
    Emergency: 'it offers the best combination of safety and travel speed for an urgent delivery',
    High: 'it provides the best balance of safety, travel time and cost for a high-priority shipment',
    Normal: 'it provides the best balance of safety, accessibility, time and cost',
  };
  const recommendationReason = `${recommended.name} is recommended because ${reasonClauses[req.priority]}.`;

  const riskCategories = buildRiskCategories(
    recommended.riskScore,
    difficulty,
    accTo,
    recommendedId,
  );
  const overallRisk = round(
    riskCategories.reduce((sum, c) => sum + c.score, 0) / riskCategories.length,
  );

  // Alternative = second-best by recommendation score.
  const alternativeId = ranked[1].id;
  const alternative = routes.find((r) => r.id === alternativeId)!;

  const recDelay = riskCategories.find((c) => c.name === 'Delay Risk')!.score;
  const altDelayCategories = buildRiskCategories(
    alternative.riskScore,
    difficulty,
    accTo,
    alternativeId,
  );
  const altDelay = altDelayCategories.find((c) => c.name === 'Delay Risk')!.score;

  const delayReductionPct = recDelay === 0 ? 0 : round(((recDelay - altDelay) / recDelay) * 100);
  const riskDifference = alternative.riskScore - recommended.riskScore;

  // Accessibility intelligence: the four spec cities plus origin & destination.
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
