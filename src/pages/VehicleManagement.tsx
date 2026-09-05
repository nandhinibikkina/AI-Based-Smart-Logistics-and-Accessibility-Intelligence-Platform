import { useState } from 'react';
import { Truck, Eye, UserPlus, RefreshCw, X, Fuel } from 'lucide-react';
import Badge from '@/components/Badge';
import {
  vehicleStatusTone,
  type Vehicle,
  type VehicleStatus,
} from '@/lib/sampleData';
import { useDeliveries } from '@/store/DeliveriesContext';

const vehicleStatusOptions: VehicleStatus[] = ['Available', 'Assigned', 'In Transit', 'Maintenance'];

export default function VehicleManagement() {
  const { vehicles, deliveries, updateVehicleStatus, assignDeliveryToVehicle } = useDeliveries();
  const [viewing, setViewing] = useState<Vehicle | null>(null);
  const [assigning, setAssigning] = useState<Vehicle | null>(null);
  const [updating, setUpdating] = useState<Vehicle | null>(null);

  const assignDelivery = (vehicleId: string, deliveryId: string) => {
    assignDeliveryToVehicle(vehicleId, deliveryId);
    setAssigning(null);
  };

  const handleUpdateStatus = (id: string, status: VehicleStatus) => {
    updateVehicleStatus(id, status);
    setUpdating(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <Truck className="h-3.5 w-3.5" />
          Vehicles
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          Vehicle Management
        </h1>
        <p className="mt-1.5 max-w-2xl text-base text-slate-600">
          Monitor fleet status, assign deliveries and update vehicle conditions
          across the NER logistics network.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Vehicles', value: vehicles.length },
          { label: 'Available', value: vehicles.filter((v) => v.status === 'Available').length },
          { label: 'In Transit', value: vehicles.filter((v) => v.status === 'In Transit').length },
          { label: 'Maintenance', value: vehicles.filter((v) => v.status === 'Maintenance').length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <section className="mt-8 hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Fleet</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Vehicle ID', 'Driver', 'Type', 'Capacity', 'Location', 'Fuel', 'Status', 'Assigned Delivery', 'Actions'].map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{v.id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{v.driver}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{v.type}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{v.capacity}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{v.location}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-3.5 w-3.5 text-slate-400" />
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${v.fuel < 40 ? 'bg-red-500' : v.fuel < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${v.fuel}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{v.fuel}%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge tone={vehicleStatusTone(v.status)}>{v.status}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{v.assignedDelivery}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setAssigning(v)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                        <UserPlus className="h-3.5 w-3.5" /> Assign
                      </button>
                      <button onClick={() => setViewing(v)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button onClick={() => setUpdating(v)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
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

      {/* Mobile cards */}
      <div className="mt-8 grid gap-4 lg:hidden">
        {vehicles.map((v) => (
          <div key={v.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{v.id}</p>
                <p className="text-sm text-slate-500">{v.driver} · {v.type}</p>
              </div>
              <Badge tone={vehicleStatusTone(v.status)}>{v.status}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <p className="text-slate-600">Capacity: <span className="font-medium text-slate-800">{v.capacity}</span></p>
              <p className="text-slate-600">Location: <span className="font-medium text-slate-800">{v.location}</span></p>
              <p className="text-slate-600">Fuel: <span className="font-medium text-slate-800">{v.fuel}%</span></p>
              <p className="text-slate-600">Delivery: <span className="font-medium text-slate-800">{v.assignedDelivery}</span></p>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setAssigning(v)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <UserPlus className="mr-1 inline h-3.5 w-3.5" /> Assign
              </button>
              <button onClick={() => setViewing(v)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <Eye className="mr-1 inline h-3.5 w-3.5" /> View
              </button>
              <button onClick={() => setUpdating(v)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <RefreshCw className="mr-1 inline h-3.5 w-3.5" /> Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View modal */}
      {viewing && (
        <Modal title={`Vehicle ${viewing.id}`} onClose={() => setViewing(null)}>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Driver" value={viewing.driver} />
            <Detail label="Type" value={viewing.type} />
            <Detail label="Capacity" value={viewing.capacity} />
            <Detail label="Location" value={viewing.location} />
            <Detail label="Fuel Level" value={`${viewing.fuel}%`} />
            <Detail label="Assigned Delivery" value={viewing.assignedDelivery} />
            <div>
              <dt className="text-xs font-medium text-slate-500">Status</dt>
              <dd className="mt-1"><Badge tone={vehicleStatusTone(viewing.status)}>{viewing.status}</Badge></dd>
            </div>
          </dl>
        </Modal>
      )}

      {/* Assign modal */}
      {assigning && (
        <Modal title={`Assign Delivery — ${assigning.id}`} onClose={() => setAssigning(null)}>
          <p className="mb-4 text-sm text-slate-600">
            Select a delivery to assign to {assigning.driver}'s {assigning.type}.
          </p>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            <button
              onClick={() => assignDelivery(assigning.id, 'none')}
              className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              None (unassign)
            </button>
            {deliveries.map((d) => (
              <button
                key={d.id}
                onClick={() => assignDelivery(assigning.id, d.id)}
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50"
              >
                <span className="font-semibold text-slate-900">{d.id}</span>
                <span className="text-slate-600"> · {d.from} → {d.to} · {d.type}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Update status modal */}
      {updating && (
        <Modal title={`Update Status — ${updating.id}`} onClose={() => setUpdating(null)}>
          <p className="mb-4 text-sm text-slate-600">
            Current status: <Badge tone={vehicleStatusTone(updating.status)}>{updating.status}</Badge>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {vehicleStatusOptions.map((s) => (
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
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
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
