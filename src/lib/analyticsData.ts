// Sample data for the Analytics and Alerts features.
// Local demo data only — no backend.

export const analyticsKpis = [
  { label: 'Total Deliveries', value: '248' },
  { label: 'Successful Deliveries', value: '221' },
  { label: 'Delayed Deliveries', value: '27' },
  { label: 'Average Delivery Time', value: '7h 18m' },
  { label: 'Vehicle Utilization', value: '78%' },
  { label: 'Estimated Cost Savings', value: '₹3.42L' },
];

export const deliveriesByState = [
  { state: 'Assam', count: 72 },
  { state: 'Arunachal Pradesh', count: 38 },
  { state: 'Meghalaya', count: 31 },
  { state: 'Sikkim', count: 24 },
  { state: 'Nagaland', count: 22 },
  { state: 'Manipur', count: 29 },
  { state: 'Mizoram', count: 18 },
  { state: 'Tripura', count: 14 },
];

export const deliveryStatusData = [
  { label: 'Delivered', value: 221, color: 'bg-emerald-500' },
  { label: 'In Transit', value: 14, color: 'bg-blue-500' },
  { label: 'Planned', value: 9, color: 'bg-slate-400' },
  { label: 'Delayed', value: 27, color: 'bg-amber-500' },
];

export const avgDeliveryTimeData = [
  { month: 'Feb', hours: 8.2 },
  { month: 'Mar', hours: 7.9 },
  { month: 'Apr', hours: 7.5 },
  { month: 'May', hours: 7.8 },
  { month: 'Jun', hours: 7.2 },
  { month: 'Jul', hours: 7.3 },
  { month: 'Aug', hours: 7.3 },
];

export const vehicleUtilizationData = [
  { type: '4x4', value: 88, color: 'bg-teal-500' },
  { type: 'Truck', value: 72, color: 'bg-blue-500' },
  { type: 'Mini Truck', value: 65, color: 'bg-cyan-500' },
  { type: 'Van', value: 54, color: 'bg-indigo-500' },
];

export const routeRiskDistribution = [
  { level: 'Low', value: 62, color: 'bg-emerald-500' },
  { level: 'Medium', value: 28, color: 'bg-amber-500' },
  { level: 'High', value: 10, color: 'bg-red-500' },
];

export const delayReasonsData = [
  { reason: 'Weather', count: 12, color: 'bg-blue-500' },
  { reason: 'Road blockage', count: 8, color: 'bg-amber-500' },
  { reason: 'Traffic', count: 5, color: 'bg-slate-400' },
  { reason: 'Connectivity', count: 4, color: 'bg-cyan-500' },
  { reason: 'Vehicle issue', count: 3, color: 'bg-red-500' },
];

export const performanceInsights = [
  { label: 'Delivery success rate', value: '89%' },
  { label: 'Average delay', value: '1h 24m' },
  { label: 'Highest risk region', value: 'Arunachal Pradesh' },
  { label: 'Most utilized vehicle type', value: '4x4' },
  { label: 'Estimated cost saving', value: '₹3.42L' },
];

export type AlertSeverity = 'High' | 'Medium' | 'Low';
export type AlertStatus = 'Unread' | 'Read';
export type AlertType = 'Weather' | 'Road' | 'Delivery' | 'Vehicle' | 'Success';

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  location: string;
  time: string;
  severity: AlertSeverity;
  status: AlertStatus;
}

export const sampleAlerts: AlertItem[] = [
  {
    id: 'ALR-001',
    type: 'Weather',
    title: 'Heavy rainfall detected',
    description: 'Continuous heavy rainfall over the last 6 hours is reducing visibility and increasing landslide risk along the Tawang corridor. Expect significant delays.',
    location: 'Tawang',
    time: '10 min ago',
    severity: 'High',
    status: 'Unread',
  },
  {
    id: 'ALR-002',
    type: 'Road',
    title: 'Possible road blockage',
    description: 'Reports of debris on the Tawang Corridor near Sela Pass. Vehicles are advised to take the valley detour until the route is cleared.',
    location: 'Tawang Corridor',
    time: '25 min ago',
    severity: 'High',
    status: 'Unread',
  },
  {
    id: 'ALR-003',
    type: 'Delivery',
    title: 'Delivery delayed',
    description: 'Delivery GHT-1026 from Gangtok to Itanagar is running 2 hours behind schedule due to adverse road conditions.',
    location: 'Imphal',
    time: '1 hr ago',
    severity: 'Medium',
    status: 'Unread',
  },
  {
    id: 'ALR-004',
    type: 'Vehicle',
    title: 'Low fuel level',
    description: 'Vehicle TRK-103 currently stationed at Itanagar reports fuel below 45%. Refueling is recommended before the next dispatch.',
    location: 'Itanagar',
    time: '2 hr ago',
    severity: 'Medium',
    status: 'Read',
  },
  {
    id: 'ALR-005',
    type: 'Success',
    title: 'Delivery completed',
    description: 'Delivery GHT-1028 from Guwahati to Gangtok has been successfully delivered ahead of the estimated arrival time.',
    location: 'Shillong',
    time: '3 hr ago',
    severity: 'Low',
    status: 'Read',
  },
];

export const severityTone = (s: AlertSeverity): 'red' | 'amber' | 'green' =>
  s === 'High' ? 'red' : s === 'Medium' ? 'amber' : 'green';
