import { useState } from 'react';
import { Package, Eye, MapPin, RefreshCw, X } from 'lucide-react';
import Badge from '@/components/Badge';
import LiveMap from '@/components/LiveMap';
import { sampleRoutes } from '@/lib/sampleData';
import {
  deliveryStatusFlow,
  deliveryStatusTone,
  riskTone,
  type Delivery,
  type DeliveryStatus,
} from '@/lib/sampleData';
import { useDeliveries } from '@/store/DeliveriesContext';
import { navigate } from '@/hooks/useHashRoute';

const cols = ['Delivery ID', 'From', 'To', 'Type', 'Weight', 'Vehicle', 'Priority', 'Status', 'ETA', 'Risk', 'Cost', 'Actions'];

export default function DeliveryManagement() {
  const { deliveries, updateDeliveryStatus } = useDeliveries();
  const [viewing, setViewing] = useState<Delivery | null>(null);
  const [tracking, setTracking] = useState<Delivery | null>(null);
  const [updating, setUpdating] = useState<Delivery | null>(null);

  const handleUpdateStatus = (id: string, status: DeliveryStatus) => {
    updateDeliveryStatus(id, status);
    setUpdating(null);
  };

  const startTracking = (d: Delivery) => {
    setTracking(null);
    navigate('live-map');
    window.setTimeout(() => {
      window.location.hash = `live-map?deliveryId=${d.id}`;
    }, 0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <Package className="h-3.5 w-3.5" />
          Deliveries
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          Delivery Management
        </h1>
        <p className="mt-1.5 max-w-2xl text-base text-slate-600">
          Track and manage all active deliveries across the North-East India
          logistics network.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Deliveries', value: deliveries.length },
          { label: 'In Transit', value: deliveries.filter((d) => d.status === 'In Transit').length },
          { label: 'Delayed', value: deliveries.filter((d) => d.status === 'Delayed').length },
          { label: 'Delivered', value: deliveries.filter((d) => d.status === 'Delivered').length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">All Deliveries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {cols.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{d.id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{d.from}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{d.to}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{d.type}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{d.weight}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{d.vehicle}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{d.priority}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge tone={deliveryStatusTone(d.status)}>{d.status}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{d.eta}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge tone={riskTone(d.risk)}>{d.risk}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{d.cost}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewing(d)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button
                        onClick={() => startTracking(d)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <MapPin className="h-3.5 w-3.5" /> Track
                      </button>
                      <button
                        onClick={() => setUpdating(d)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Status
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* View modal */}
      {viewing && (
        <Modal title={`Delivery ${viewing.id}`} onClose={() => setViewing(null)}>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="From" value={viewing.from} />
            <Detail label="To" value={viewing.to} />
            <Detail label="Type" value={viewing.type} />
            <Detail label="Weight" value={viewing.weight} />
            <Detail label="Vehicle" value={viewing.vehicle} />
            <Detail label="Priority" value={viewing.priority} />
            <Detail label="ETA" value={viewing.eta} />
            <Detail label="Cost" value={viewing.cost} />
            <div>
              <dt className="text-xs font-medium text-slate-500">Status</dt>
              <dd className="mt-1"><Badge tone={deliveryStatusTone(viewing.status)}>{viewing.status}</Badge></dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Risk</dt>
              <dd className="mt-1"><Badge tone={riskTone(viewing.risk)}>{viewing.risk}</Badge></dd>
            </div>
            {viewing.selectedRoute && (
              <>
                <Detail label="Selected Route" value={viewing.selectedRoute.name} />
                <Detail label="Distance" value={`${viewing.selectedRoute.distance} km`} />
                <Detail label="Accessibility" value={`${viewing.selectedRoute.accessibilityScore}/100`} />
                <Detail label="Delay Probability" value={`${viewing.selectedRoute.delayProbability}%`} />
              </>
            )}
          </dl>
        </Modal>
      )}

      {/* Track modal */}
      {tracking && (
        <Modal title={`Tracking ${tracking.id}`} onClose={() => setTracking(null)} wide>
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Detail label="From" value={tracking.from} />
            <Detail label="To" value={tracking.to} />
            <Detail label="Status" value={tracking.status} />
            <Detail label="ETA" value={tracking.eta} />
          </div>
          <LiveMap
            from={tracking.from}
            to={tracking.to}
            highlightLat={tracking.lat}
            highlightLng={tracking.lng}
            highlightLabel={`${tracking.id} — ${tracking.from} → ${tracking.to}`}
            className="h-[360px]"
          />
        </Modal>
      )}

      {/* Update status modal */}
      {updating && (
        <Modal title={`Update Status — ${updating.id}`} onClose={() => setUpdating(null)}>
          <p className="mb-4 text-sm text-slate-600">
            Current status: <Badge tone={deliveryStatusTone(updating.status)}>{updating.status}</Badge>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {deliveryStatusFlow.map((s) => (
              <button
                key={s}
                onClick={() => handleUpdateStatus(updating.id, s)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  updating.status === s
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function Modal({
  title,
  onClose,
  wide,
  children,
}: {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} rounded-2xl bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
