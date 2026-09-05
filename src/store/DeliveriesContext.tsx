import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  sampleDeliveries,
  sampleVehicles,
  type Delivery,
  type DeliveryStatus,
  type Vehicle,
  type VehicleStatus,
} from '@/lib/sampleData';

const STORAGE_KEY = 'nerlink_deliveries';
const VEHICLES_STORAGE_KEY = 'nerlink_vehicles';

interface DeliveriesContextValue {
  deliveries: Delivery[];
  vehicles: Vehicle[];
  addDelivery: (delivery: Delivery) => void;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => void;
  getDelivery: (id: string) => Delivery | undefined;
  assignVehicleToDelivery: (vehicleId: string, deliveryId: string) => void;
  updateVehicleStatus: (id: string, status: VehicleStatus) => void;
  assignDeliveryToVehicle: (vehicleId: string, deliveryId: string) => void;
}

const DeliveriesContext = createContext<DeliveriesContextValue | null>(null);

function loadDeliveries(): Delivery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sampleDeliveries;
    const parsed = JSON.parse(raw) as Delivery[];
    if (!Array.isArray(parsed) || parsed.length === 0) return sampleDeliveries;
    return parsed;
  } catch {
    return sampleDeliveries;
  }
}

function loadVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (!raw) return sampleVehicles;
    const parsed = JSON.parse(raw) as Vehicle[];
    if (!Array.isArray(parsed) || parsed.length === 0) return sampleVehicles;
    return parsed;
  } catch {
    return sampleVehicles;
  }
}

export function DeliveriesProvider({ children }: { children: ReactNode }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(loadDeliveries);
  const [vehicles, setVehicles] = useState<Vehicle[]>(loadVehicles);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  const addDelivery = useCallback((delivery: Delivery) => {
    setDeliveries((prev) => [delivery, ...prev]);
  }, []);

  const updateDeliveryStatus = useCallback((id: string, status: DeliveryStatus) => {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }, []);

  const getDelivery = useCallback(
    (id: string) => deliveries.find((d) => d.id === id),
    [deliveries],
  );

  const assignVehicleToDelivery = useCallback((vehicleId: string, deliveryId: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              assignedDelivery: deliveryId,
              status: 'Assigned',
            }
          : v,
      ),
    );
  }, []);

  const updateVehicleStatus = useCallback((id: string, status: VehicleStatus) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
  }, []);

  const assignDeliveryToVehicle = useCallback((vehicleId: string, deliveryId: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              assignedDelivery: deliveryId === 'none' ? '—' : deliveryId,
              status: deliveryId === 'none' ? 'Available' : 'Assigned',
            }
          : v,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      deliveries,
      vehicles,
      addDelivery,
      updateDeliveryStatus,
      getDelivery,
      assignVehicleToDelivery,
      updateVehicleStatus,
      assignDeliveryToVehicle,
    }),
    [
      deliveries,
      vehicles,
      addDelivery,
      updateDeliveryStatus,
      getDelivery,
      assignVehicleToDelivery,
      updateVehicleStatus,
      assignDeliveryToVehicle,
    ],
  );

  return <DeliveriesContext.Provider value={value}>{children}</DeliveriesContext.Provider>;
}

export function useDeliveries(): DeliveriesContextValue {
  const ctx = useContext(DeliveriesContext);
  if (!ctx) {
    throw new Error('useDeliveries must be used within a DeliveriesProvider');
  }
  return ctx;
}
