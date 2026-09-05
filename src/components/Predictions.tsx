import { TrendingUp, Clock, ShieldAlert, IndianRupee, Gauge } from 'lucide-react';
import Badge from '@/components/Badge';

interface PredictionProps {
  delayProbability?: number;
  expectedDelay?: string;
  routeRisk?: 'Low' | 'Medium' | 'High';
  expectedCost?: string;
  altBenefit?: string;
  confidence?: number;
  explanation?: string;
  compact?: boolean;
}

export default function Predictions({
  delayProbability = 21,
  expectedDelay = '1h 15m',
  routeRisk = 'Low',
  expectedCost = '₹7,850',
  altBenefit = '28% lower delay risk',
  confidence = 86,
  explanation = 'Based on the current demo conditions, the selected route has a 21% probability of delay.',
  compact = false,
}: PredictionProps) {
  const riskTone = routeRisk === 'High' ? 'red' : routeRisk === 'Medium' ? 'amber' : 'green';

  const metrics = [
    { icon: TrendingUp, label: 'Delay Probability', value: `${delayProbability}%`, bar: delayProbability, barColor: 'bg-amber-500' },
    { icon: Clock, label: 'Expected Delay', value: expectedDelay },
    { icon: ShieldAlert, label: 'Route Risk', value: routeRisk, badge: riskTone },
    { icon: IndianRupee, label: 'Expected Cost', value: expectedCost },
    { icon: Gauge, label: 'Alt. Route Benefit', value: altBenefit },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
          <TrendingUp className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-slate-900">Smart Predictions</h2>
      </div>

      <div className={`mt-5 grid gap-4 ${compact ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-5'}`}>
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <m.icon className="h-4 w-4" /> {m.label}
            </div>
            {m.badge ? (
              <div className="mt-1.5">
                <Badge tone={m.badge as 'green' | 'amber' | 'red'}>{m.value}</Badge>
              </div>
            ) : (
              <p className="mt-1 text-xl font-bold text-slate-900">{m.value}</p>
            )}
            {m.bar !== undefined && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${m.barColor}`} style={{ width: `${m.bar}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <p className="text-sm leading-relaxed text-slate-700">{explanation}</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Prediction Confidence</span>
          <div className="h-2 flex-1 max-w-[200px] overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${confidence}%` }} />
          </div>
          <span className="text-sm font-bold text-teal-600">{confidence}%</span>
        </div>
      </div>
    </section>
  );
}
