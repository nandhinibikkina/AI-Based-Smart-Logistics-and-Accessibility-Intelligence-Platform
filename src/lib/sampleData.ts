// Shared sample data for RouteX AI logistics features.
// Local demo data & type definitions for North-East India platform.

export interface MapLocation {
  name: string;
  lat: number;
  lng: number;
  type: 'delivery' | 'vehicle' | 'warehouse' | 'high-risk';
  label: string;
}

export const mapLocations: MapLocation[] = [
  { name: 'Guwahati', lat: 26.1445, lng: 91.7362, type: 'warehouse', label: 'Main Hub Warehouse' },
  { name: 'Tawang', lat: 27.586, lng: 91.8594, type: 'high-risk', label: 'High-Risk Mountain Route' },
  { name: 'Shillong', lat: 25.5788, lng: 91.8933, type: 'delivery', label: 'Delivery Point' },
  { name: 'Imphal', lat: 24.817, lng: 93.9368, type: 'delivery', label: 'Delivery Point' },
  { name: 'Gangtok', lat: 27.3389, lng: 88.6065, type: 'delivery', label: 'Delivery Point' },
  { name: 'Itanagar', lat: 27.0844, lng: 93.6053, type: 'delivery', label: 'Delivery Point' },
  { name: 'Aizawl', lat: 23.7271, lng: 92.7176, type: 'delivery', label: 'Delivery Point' },
  { name: 'Agartala', lat: 23.8315, lng: 91.2868, type: 'delivery', label: 'Delivery Point' },
  { name: 'Kohima', lat: 25.6751, lng: 94.1086, type: 'delivery', label: 'Delivery Point' },
  { name: 'Dispur', lat: 26.1406, lng: 91.7904, type: 'warehouse', label: 'Capital Hub Warehouse' },
  // Sample vehicle positions near Guwahati and Shillong
  { name: 'Vehicle TRK-102', lat: 26.4, lng: 91.9, type: 'vehicle', label: 'In Transit — TRK-102' },
  { name: 'Vehicle TRK-104', lat: 25.9, lng: 91.7, type: 'vehicle', label: 'In Transit — TRK-104' },
];

export interface SampleRoute {
  id: string;
  from: string;
  to: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  color: string;
  label: string;
}

export const sampleRoutes: SampleRoute[] = [
  { id: 'r1', from: 'Guwahati', to: 'Tawang', fromLat: 26.1445, fromLng: 91.7362, toLat: 27.586, toLng: 91.8594, color: '#ef4444', label: 'Guwahati → Tawang (High Risk)' },
  { id: 'r2', from: 'Guwahati', to: 'Shillong', fromLat: 26.1445, fromLng: 91.7362, toLat: 25.5788, toLng: 91.8933, color: '#0d9488', label: 'Guwahati → Shillong' },
  { id: 'r3', from: 'Guwahati', to: 'Imphal', fromLat: 26.1445, fromLng: 91.7362, toLat: 24.817, toLng: 93.9368, color: '#0d9488', label: 'Guwahati → Imphal' },
  { id: 'r4', from: 'Shillong', to: 'Aizawl', fromLat: 25.5788, fromLng: 91.8933, toLat: 23.7271, toLng: 92.7176, color: '#0d9488', label: 'Shillong → Aizawl' },
];

export type DeliveryStatus = 'Planned' | 'In Transit' | 'Delivered' | 'Delayed';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type Priority = 'Normal' | 'High' | 'Emergency';
export type TrackingStatus = 'Preparing' | 'Dispatched' | 'In Transit' | 'Near Destination' | 'Delivered';
export type OrderMode = 'online' | 'offline';
export type OrderStatus = 'Confirmed' | 'Pending Sync' | 'Offline Order' | 'Synced';

export interface SelectedRoute {
  id: string;
  name: string;
  category?: 'Fastest' | 'Safest' | 'Balanced';
  distance: number;
  estimatedTime: string;
  estimatedCost: number;
  riskScore: number;
  riskLevel: RiskLevel;
  accessibilityScore: number;
  delayProbability: number;
  routeScore?: number;
}

export interface Order {
  id: string; // ORD-XXXX
  deliveryId: string; // RX-XXXX
  routeId: string; // route-XXXX
  origin: string;
  destination: string;
  vehicle: string;
  cargoType: string;
  weight: string;
  priority: Priority;
  mode: OrderMode;
  status: OrderStatus;
  trackingStatus: TrackingStatus;
  createdAt: string;
}

export interface TrackingRecord {
  trackingId: string; // TRK-XXXX
  orderId: string; // ORD-XXXX
  deliveryId: string; // RX-XXXX
  routeId: string;
  status: TrackingStatus;
  currentLocation: string;
  destination: string;
  progress: number;
  eta: string;
  lastUpdated: string;
}

export interface Delivery {
  id: string;
  orderId?: string;
  routeId?: string;
  from: string;
  to: string;
  type: string;
  weight: string;
  vehicle: string;
  status: DeliveryStatus;
  eta: string;
  risk: RiskLevel;
  cost: string;
  lat: number;
  lng: number;
  priority: Priority;
  selectedRoute?: SelectedRoute;
  delayProbability?: number;
  createdAt?: string;
}

export const sampleDeliveries: Delivery[] = [
  { id: 'RX-2026-0001', orderId: 'ORD-1001', routeId: 'route-guwahati-tawang-fastest', from: 'Guwahati', to: 'Tawang', type: 'Medicine', weight: '250 kg', vehicle: '4x4', status: 'In Transit', eta: '6h 40m', risk: 'Low', cost: '₹8,900', lat: 26.9, lng: 91.85, priority: 'Emergency', selectedRoute: { id: 'route-guwahati-tawang-fastest', name: 'Route 1 – Fastest Route (Guwahati → Tawang Express)', category: 'Fastest', distance: 440, estimatedTime: '6h 40m', estimatedCost: 8900, riskScore: 28, riskLevel: 'Low', accessibilityScore: 84, delayProbability: 13, routeScore: 88 } },
  { id: 'RX-2026-0002', orderId: 'ORD-1002', routeId: 'route-shillong-imphal-safest', from: 'Shillong', to: 'Imphal', type: 'Food', weight: '500 kg', vehicle: 'Mini Truck', status: 'Planned', eta: '8h 20m', risk: 'Medium', cost: '₹6,200', lat: 25.5788, lng: 91.8933, priority: 'Normal', selectedRoute: { id: 'route-shillong-imphal-safest', name: 'Route 2 – Safest Corridor (Shillong → Imphal Low-Risk Bypass)', category: 'Safest', distance: 310, estimatedTime: '8h 20m', estimatedCost: 6200, riskScore: 42, riskLevel: 'Medium', accessibilityScore: 78, delayProbability: 18, routeScore: 81 } },
  { id: 'RX-2026-0003', orderId: 'ORD-1003', routeId: 'route-gangtok-itanagar-balanced', from: 'Gangtok', to: 'Itanagar', type: 'Medical Supplies', weight: '180 kg', vehicle: 'Van', status: 'Delayed', eta: '11h 10m', risk: 'High', cost: '₹9,400', lat: 27.2, lng: 90.1, priority: 'High', selectedRoute: { id: 'route-gangtok-itanagar-balanced', name: 'Route 3 – Balanced Highway (Gangtok → Itanagar Regional Link)', category: 'Balanced', distance: 520, estimatedTime: '11h 10m', estimatedCost: 9400, riskScore: 72, riskLevel: 'High', accessibilityScore: 68, delayProbability: 28, routeScore: 75 } },
  { id: 'RX-2026-0004', orderId: 'ORD-1004', routeId: 'route-aizawl-agartala-fastest', from: 'Aizawl', to: 'Agartala', type: 'Electronics', weight: '120 kg', vehicle: '4x4', status: 'In Transit', eta: '7h 35m', risk: 'Low', cost: '₹4,800', lat: 23.8, lng: 92.0, priority: 'Normal', selectedRoute: { id: 'route-aizawl-agartala-fastest', name: 'Route 1 – Fastest Route (Aizawl → Agartala Express)', category: 'Fastest', distance: 380, estimatedTime: '7h 35m', estimatedCost: 4800, riskScore: 24, riskLevel: 'Low', accessibilityScore: 82, delayProbability: 12, routeScore: 86 } },
  { id: 'RX-2026-0005', orderId: 'ORD-1005', routeId: 'route-guwahati-gangtok-safest', from: 'Guwahati', to: 'Gangtok', type: 'General Goods', weight: '800 kg', vehicle: 'Truck', status: 'Delivered', eta: '—', risk: 'Low', cost: '₹7,300', lat: 27.3389, lng: 88.6065, priority: 'Normal', selectedRoute: { id: 'route-guwahati-gangtok-safest', name: 'Route 2 – Safest Corridor (Guwahati → Gangtok Low-Risk Bypass)', category: 'Safest', distance: 540, estimatedTime: '10h 15m', estimatedCost: 7300, riskScore: 30, riskLevel: 'Low', accessibilityScore: 89, delayProbability: 14, routeScore: 84 } },
  { id: 'RX-2026-0006', orderId: 'ORD-1006', routeId: 'route-kohima-dispur-balanced', from: 'Kohima', to: 'Dispur', type: 'Electronics', weight: '300 kg', vehicle: 'Mini Truck', status: 'In Transit', eta: '5h 15m', risk: 'Medium', cost: '₹3,900', lat: 25.9, lng: 93.2, priority: 'High', selectedRoute: { id: 'route-kohima-dispur-balanced', name: 'Route 3 – Balanced Highway (Kohima → Dispur Regional Link)', category: 'Balanced', distance: 350, estimatedTime: '5h 15m', estimatedCost: 3900, riskScore: 48, riskLevel: 'Medium', accessibilityScore: 74, delayProbability: 20, routeScore: 80 } },
];

export const sampleOrders: Order[] = [
  { id: 'ORD-1001', deliveryId: 'RX-2026-0001', routeId: 'route-guwahati-tawang-fastest', origin: 'Guwahati', destination: 'Tawang', vehicle: '4x4', cargoType: 'Medicine', weight: '250 kg', priority: 'Emergency', mode: 'online', status: 'Confirmed', trackingStatus: 'In Transit', createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 'ORD-1002', deliveryId: 'RX-2026-0002', routeId: 'route-shillong-imphal-safest', origin: 'Shillong', destination: 'Imphal', vehicle: 'Mini Truck', cargoType: 'Food', weight: '500 kg', priority: 'Normal', mode: 'online', status: 'Confirmed', trackingStatus: 'Preparing', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'ORD-1003', deliveryId: 'RX-2026-0003', routeId: 'route-gangtok-itanagar-balanced', origin: 'Gangtok', destination: 'Itanagar', vehicle: 'Van', cargoType: 'Medical Supplies', weight: '180 kg', priority: 'High', mode: 'online', status: 'Confirmed', trackingStatus: 'In Transit', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'ORD-1004', deliveryId: 'RX-2026-0004', routeId: 'route-aizawl-agartala-fastest', origin: 'Aizawl', destination: 'Agartala', vehicle: '4x4', cargoType: 'Electronics', weight: '120 kg', priority: 'Normal', mode: 'online', status: 'Confirmed', trackingStatus: 'In Transit', createdAt: new Date(Date.now() - 3600000 * 1).toISOString() },
  { id: 'ORD-1005', deliveryId: 'RX-2026-0005', routeId: 'route-guwahati-gangtok-safest', origin: 'Guwahati', destination: 'Gangtok', vehicle: 'Truck', cargoType: 'General Goods', weight: '800 kg', priority: 'Normal', mode: 'online', status: 'Confirmed', trackingStatus: 'Delivered', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: 'ORD-1006', deliveryId: 'RX-2026-0006', routeId: 'route-kohima-dispur-balanced', origin: 'Kohima', destination: 'Dispur', vehicle: 'Mini Truck', cargoType: 'Electronics', weight: '300 kg', priority: 'High', mode: 'online', status: 'Confirmed', trackingStatus: 'In Transit', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
];

export const sampleTrackingRecords: TrackingRecord[] = [
  { trackingId: 'TRK-1001', orderId: 'ORD-1001', deliveryId: 'RX-2026-0001', routeId: 'route-guwahati-tawang-fastest', status: 'In Transit', currentLocation: 'Bomdila Pass', destination: 'Tawang', progress: 45, eta: '6h 40m', lastUpdated: new Date().toISOString() },
  { trackingId: 'TRK-1002', orderId: 'ORD-1002', deliveryId: 'RX-2026-0002', routeId: 'route-shillong-imphal-safest', status: 'Preparing', currentLocation: 'Shillong Hub', destination: 'Imphal', progress: 0, eta: '8h 20m', lastUpdated: new Date().toISOString() },
  { trackingId: 'TRK-1003', orderId: 'ORD-1003', deliveryId: 'RX-2026-0003', routeId: 'route-gangtok-itanagar-balanced', status: 'In Transit', currentLocation: 'Tezpur Corridor', destination: 'Itanagar', progress: 60, eta: '11h 10m', lastUpdated: new Date().toISOString() },
  { trackingId: 'TRK-1004', orderId: 'ORD-1004', deliveryId: 'RX-2026-0004', routeId: 'route-aizawl-agartala-fastest', status: 'In Transit', currentLocation: 'Silchar Checkpoint', destination: 'Agartala', progress: 50, eta: '7h 35m', lastUpdated: new Date().toISOString() },
  { trackingId: 'TRK-1005', orderId: 'ORD-1005', deliveryId: 'RX-2026-0005', routeId: 'route-guwahati-gangtok-safest', status: 'Delivered', currentLocation: 'Gangtok Hub', destination: 'Gangtok', progress: 100, eta: 'Delivered', lastUpdated: new Date().toISOString() },
  { trackingId: 'TRK-1006', orderId: 'ORD-1006', deliveryId: 'RX-2026-0006', routeId: 'route-kohima-dispur-balanced', status: 'In Transit', currentLocation: 'Nagaon Bypass', destination: 'Dispur', progress: 70, eta: '5h 15m', lastUpdated: new Date().toISOString() },
];

export type VehicleStatus = 'Available' | 'Assigned' | 'In Transit' | 'Maintenance';

export interface Vehicle {
  id: string;
  driver: string;
  type: string;
  capacity: string;
  location: string;
  fuel: number;
  status: VehicleStatus;
  assignedDelivery: string;
}

export const sampleVehicles: Vehicle[] = [
  { id: 'TRK-101', driver: 'Ravi Kumar', type: '4x4', capacity: '500 kg', location: 'Guwahati', fuel: 82, status: 'Available', assignedDelivery: '—' },
  { id: 'TRK-102', driver: 'Arun Das', type: 'Truck', capacity: '2000 kg', location: 'Shillong', fuel: 64, status: 'In Transit', assignedDelivery: 'RX-2026-0002' },
  { id: 'TRK-103', driver: 'Suresh', type: 'Mini Truck', capacity: '1000 kg', location: 'Itanagar', fuel: 45, status: 'Assigned', assignedDelivery: 'RX-2026-0006' },
  { id: 'TRK-104', driver: 'Manoj', type: 'Van', capacity: '700 kg', location: 'Gangtok', fuel: 76, status: 'Available', assignedDelivery: '—' },
  { id: 'TRK-105', driver: 'Priya Gogoi', type: '4x4', capacity: '500 kg', location: 'Aizawl', fuel: 38, status: 'Maintenance', assignedDelivery: '—' },
  { id: 'TRK-106', driver: 'Deepak Roy', type: 'Truck', capacity: '2000 kg', location: 'Agartala', fuel: 91, status: 'Available', assignedDelivery: '—' },
];

export const deliveryStatusFlow: DeliveryStatus[] = ['Planned', 'In Transit', 'Delivered', 'Delayed'];

export const riskTone = (r: RiskLevel): 'green' | 'amber' | 'red' =>
  r === 'High' ? 'red' : r === 'Medium' ? 'amber' : 'green';

export const deliveryStatusTone = (s: DeliveryStatus): 'green' | 'amber' | 'red' | 'blue' | 'slate' =>
  s === 'In Transit' ? 'blue' : s === 'Delayed' ? 'red' : s === 'Delivered' ? 'green' : 'slate';

export const vehicleStatusTone = (s: VehicleStatus): 'green' | 'amber' | 'red' | 'blue' | 'slate' =>
  s === 'Available' ? 'green' : s === 'In Transit' ? 'blue' : s === 'Maintenance' ? 'red' : 'amber';

