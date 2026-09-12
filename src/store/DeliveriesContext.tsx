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
  sampleOrders,
  sampleTrackingRecords,
  sampleVehicles,
  type Delivery,
  type DeliveryStatus,
  type Order,
  type TrackingRecord,
  type TrackingStatus,
  type Vehicle,
  type VehicleStatus,
} from '@/lib/sampleData';

const STORAGE_KEY = 'nerlink_deliveries';
const ORDERS_STORAGE_KEY = 'nerlink_orders';
const TRACKING_STORAGE_KEY = 'nerlink_tracking';
const VEHICLES_STORAGE_KEY = 'nerlink_vehicles';

interface DeliveriesContextValue {
  deliveries: Delivery[];
  vehicles: Vehicle[];
  orders: Order[];
  trackingRecords: TrackingRecord[];
  addDelivery: (delivery: Delivery) => void;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => void;
  getDelivery: (id: string) => Delivery | undefined;
  getOrder: (id: string) => Order | undefined;
  getTrackingRecord: (id: string) => TrackingRecord | undefined;
  createOrderConfirmation: (order: Order, delivery: Delivery, tracking: TrackingRecord) => void;
  updateTrackingStatus: (orderId: string, status: TrackingStatus, progress?: number) => void;
  syncOfflineOrders: () => void;
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

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return sampleOrders;
    const parsed = JSON.parse(raw) as Order[];
    if (!Array.isArray(parsed) || parsed.length === 0) return sampleOrders;
    return parsed;
  } catch {
    return sampleOrders;
  }
}

function loadTrackingRecords(): TrackingRecord[] {
  try {
    const raw = localStorage.getItem(TRACKING_STORAGE_KEY);
    if (!raw) return sampleTrackingRecords;
    const parsed = JSON.parse(raw) as TrackingRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) return sampleTrackingRecords;
    return parsed;
  } catch {
    return sampleTrackingRecords;
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
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [trackingRecords, setTrackingRecords] = useState<TrackingRecord[]>(loadTrackingRecords);
  const [vehicles, setVehicles] = useState<Vehicle[]>(loadVehicles);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(trackingRecords));
  }, [trackingRecords]);

  useEffect(() => {
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  const addDelivery = useCallback((delivery: Delivery) => {
    setDeliveries((prev) => {
      if (prev.some((d) => d.id === delivery.id)) return prev;
      return [delivery, ...prev];
    });
  }, []);

  const createOrderConfirmation = useCallback(
    (order: Order, delivery: Delivery, tracking: TrackingRecord) => {
      setOrders((prev) => {
        if (prev.some((o) => o.id === order.id)) return prev;
        return [order, ...prev];
      });
      setDeliveries((prev) => {
        if (prev.some((d) => d.id === delivery.id)) return prev;
        return [delivery, ...prev];
      });
      setTrackingRecords((prev) => {
        if (prev.some((t) => t.trackingId === tracking.trackingId || t.orderId === tracking.orderId)) return prev;
        return [tracking, ...prev];
      });
    },
    [],
  );

  const getDelivery = useCallback(
    (id: string) => {
      const trimmed = id.trim();
      return deliveries.find(
        (d) => d.id === trimmed || d.orderId === trimmed || (d.routeId && d.routeId === trimmed),
      );
    },
    [deliveries],
  );

  const getOrder = useCallback(
    (id: string) => {
      const trimmed = id.trim();
      return orders.find(
        (o) => o.id === trimmed || o.deliveryId === trimmed || o.routeId === trimmed,
      );
    },
    [orders],
  );

  const getTrackingRecord = useCallback(
    (id: string) => {
      const trimmed = id.trim();
      return trackingRecords.find(
        (t) =>
          t.trackingId === trimmed ||
          t.orderId === trimmed ||
          t.deliveryId === trimmed ||
          t.routeId === trimmed,
      );
    },
    [trackingRecords],
  );

  const updateDeliveryStatus = useCallback((id: string, status: DeliveryStatus) => {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }, []);

  const updateTrackingStatus = useCallback(
    (orderId: string, trackingStatus: TrackingStatus, progressVal?: number) => {
      let calcProgress = progressVal;
      if (calcProgress === undefined) {
        switch (trackingStatus) {
          case 'Preparing':
            calcProgress = 0;
            break;
          case 'Dispatched':
            calcProgress = 15;
            break;
          case 'In Transit':
            calcProgress = 50;
            break;
          case 'Near Destination':
            calcProgress = 85;
            break;
          case 'Delivered':
            calcProgress = 100;
            break;
        }
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId || o.deliveryId === orderId
            ? { ...o, trackingStatus, status: trackingStatus === 'Delivered' ? 'Confirmed' : o.status }
            : o,
        ),
      );

      setTrackingRecords((prev) =>
        prev.map((t) =>
          t.orderId === orderId || t.deliveryId === orderId || t.trackingId === orderId
            ? {
                ...t,
                status: trackingStatus,
                progress: calcProgress ?? t.progress,
                lastUpdated: new Date().toISOString(),
              }
            : t,
        ),
      );

      setDeliveries((prev) =>
        prev.map((d) => {
          if (d.orderId === orderId || d.id === orderId) {
            let delStatus: DeliveryStatus = d.status;
            if (trackingStatus === 'Preparing' || trackingStatus === 'Dispatched') delStatus = 'Planned';
            else if (trackingStatus === 'In Transit' || trackingStatus === 'Near Destination') delStatus = 'In Transit';
            else if (trackingStatus === 'Delivered') delStatus = 'Delivered';
            return { ...d, status: delStatus };
          }
          return d;
        }),
      );
    },
    [],
  );

  const syncOfflineOrders = useCallback(() => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.mode === 'offline' && (o.status === 'Pending Sync' || o.status === 'Offline Order')) {
          return { ...o, status: 'Synced' };
        }
        return o;
      }),
    );
  }, []);

  // Listen to browser network reconnection to automatically sync offline orders
  useEffect(() => {
    const handleOnline = () => {
      syncOfflineOrders();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncOfflineOrders]);

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
      orders,
      trackingRecords,
      addDelivery,
      updateDeliveryStatus,
      getDelivery,
      getOrder,
      getTrackingRecord,
      createOrderConfirmation,
      updateTrackingStatus,
      syncOfflineOrders,
      assignVehicleToDelivery,
      updateVehicleStatus,
      assignDeliveryToVehicle,
    }),
    [
      deliveries,
      vehicles,
      orders,
      trackingRecords,
      addDelivery,
      updateDeliveryStatus,
      getDelivery,
      getOrder,
      getTrackingRecord,
      createOrderConfirmation,
      updateTrackingStatus,
      syncOfflineOrders,
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
