import { useState } from 'react';
import {
  Bell,
  CloudRain,
  Construction,
  Package,
  Truck,
  CheckCircle2,
  Check,
  Eye,
  X,
  type LucideIcon,
} from 'lucide-react';
import Badge from '@/components/Badge';
import {
  sampleAlerts,
  severityTone,
  type AlertItem,
  type AlertSeverity,
  type AlertType,
} from '@/lib/analyticsData';

const typeIcon: Record<AlertType, LucideIcon> = {
  Weather: CloudRain,
  Road: Construction,
  Delivery: Package,
  Vehicle: Truck,
  Success: CheckCircle2,
};

const typeAccent: Record<AlertType, string> = {
  Weather: 'text-blue-600 bg-blue-50',
  Road: 'text-amber-600 bg-amber-50',
  Delivery: 'text-teal-600 bg-teal-50',
  Vehicle: 'text-indigo-600 bg-indigo-50',
  Success: 'text-emerald-600 bg-emerald-50',
};

const filters: ('All' | AlertSeverity)[] = ['All', 'High', 'Medium', 'Low'];

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>(sampleAlerts);
  const [filter, setFilter] = useState<'All' | AlertSeverity>('All');
  const [viewing, setViewing] = useState<AlertItem | null>(null);

  const filtered = filter === 'All' ? alerts : alerts.filter((a) => a.severity === filter);

  const markRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Read' } : a)));
  };

  const unreadCount = alerts.filter((a) => a.status === 'Unread').length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <Bell className="h-3.5 w-3.5" />
          Alerts
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          Alerts &amp; Notifications
        </h1>
        <p className="mt-1.5 max-w-2xl text-base text-slate-600">
          Real-time alerts for weather, road, delivery and vehicle events
          across the NER logistics network.
        </p>
      </div>

      {/* Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Alerts', value: alerts.length },
          { label: 'Unread', value: unreadCount },
          { label: 'High Severity', value: alerts.filter((a) => a.severity === 'High').length },
          { label: 'Resolved', value: alerts.filter((a) => a.status === 'Read').length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filter === f
                ? 'bg-teal-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="mt-6 space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Bell className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              No alerts match this filter.
            </p>
          </div>
        )}

        {filtered.map((a) => {
          const Icon = typeIcon[a.type];
          const unread = a.status === 'Unread';
          return (
            <div
              key={a.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition-colors ${
                unread ? 'border-teal-200' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${typeAccent[a.type]}`}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-900">{a.title}</p>
                      {unread && (
                        <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {a.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{a.type}</span>
                      <span>·</span>
                      <span>{a.location}</span>
                      <span>·</span>
                      <span>{a.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 flex-col items-start gap-2 sm:items-end">
                  <Badge tone={severityTone(a.severity)}>{a.severity}</Badge>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setViewing(a)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </button>
                    {unread && (
                      <button
                        onClick={() => markRead(a.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Check className="h-3.5 w-3.5" /> Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details modal */}
      {viewing && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Alert Details</h3>
              <button
                onClick={() => setViewing(null)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeAccent[viewing.type]}`}>
                  {(() => {
                    const Icon = typeIcon[viewing.type];
                    return <Icon className="h-6 w-6" strokeWidth={2} />;
                  })()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{viewing.title}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge tone={severityTone(viewing.severity)}>{viewing.severity}</Badge>
                    <span className="text-xs font-medium text-slate-500">{viewing.type}</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {viewing.description}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Location</dt>
                  <dd className="mt-1 font-medium text-slate-900">{viewing.location}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Time</dt>
                  <dd className="mt-1 font-medium text-slate-900">{viewing.time}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Status</dt>
                  <dd className="mt-1"><Badge tone={viewing.status === 'Unread' ? 'amber' : 'green'}>{viewing.status}</Badge></dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Alert ID</dt>
                  <dd className="mt-1 font-medium text-slate-900">{viewing.id}</dd>
                </div>
              </dl>
              {viewing.status === 'Unread' && (
                <button
                  onClick={() => {
                    markRead(viewing.id);
                    setViewing(null);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                >
                  <Check className="h-4 w-4" /> Mark as Read
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
