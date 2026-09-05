// Shared sample data for NER-LINK AI logistics features.
// Local demo data only — no backend.

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

export interface SelectedRoute {
  id: string;
  name: string;
  distance: number;
  estimatedTime: string;
  estimatedCost: number;
  riskScore: number;
  riskLevel: RiskLevel;
  accessibilityScore: number;
  delayProbability: number;
}

export interface Delivery {
  id: string;
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
  { id: 'GHT-1024', from: 'Guwahati', to: 'Tawang', type: 'Medicine', weight: '250 kg', vehicle: '4x4', status: 'In Transit', eta: '6h 40m', risk: 'Low', cost: '₹8,900', lat: 26.9, lng: 91.85, priority: 'Emergency' },
  { id: 'GHT-1025', from: 'Shillong', to: 'Imphal', type: 'Food', weight: '500 kg', vehicle: 'Mini Truck', status: 'Planned', eta: '8h 20m', risk: 'Medium', cost: '₹6,200', lat: 25.5788, lng: 91.8933, priority: 'Normal' },
  { id: 'GHT-1026', from: 'Gangtok', to: 'Itanagar', type: 'Medical Supplies', weight: '180 kg', vehicle: 'Van', status: 'Delayed', eta: '11h 10m', risk: 'High', cost: '₹9,400', lat: 27.2, lng: 90.1, priority: 'High' },
  { id: 'GHT-1027', from: 'Aizawl', to: 'Agartala', type: 'Electronics', weight: '120 kg', vehicle: '4x4', status: 'In Transit', eta: '7h 35m', risk: 'Low', cost: '₹4,800', lat: 23.8, lng: 92.0, priority: 'Normal' },
  { id: 'GHT-1028', from: 'Guwahati', to: 'Gangtok', type: 'General Goods', weight: '800 kg', vehicle: 'Truck', status: 'Delivered', eta: '—', risk: 'Low', cost: '₹7,300', lat: 27.3389, lng: 88.6065, priority: 'Normal' },
  { id: 'GHT-1029', from: 'Kohima', to: 'Dispur', type: 'Electronics', weight: '300 kg', vehicle: 'Mini Truck', status: 'In Transit', eta: '5h 15m', risk: 'Medium', cost: '₹3,900', lat: 25.9, lng: 93.2, priority: 'High' },
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
  { id: 'TRK-102', driver: 'Arun Das', type: 'Truck', capacity: '2000 kg', location: 'Shillong', fuel: 64, status: 'In Transit', assignedDelivery: 'GHT-1025' },
  { id: 'TRK-103', driver: 'Suresh', type: 'Mini Truck', capacity: '1000 kg', location: 'Itanagar', fuel: 45, status: 'Assigned', assignedDelivery: 'GHT-1029' },
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
