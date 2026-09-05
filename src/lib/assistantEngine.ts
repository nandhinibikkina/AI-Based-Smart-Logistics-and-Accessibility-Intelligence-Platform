// Local AI Assistant response engine for NER-LINK AI.
// Rule-based prototype — no external AI API.

import { sampleDeliveries, sampleVehicles } from '@/lib/sampleData';
import { delayReasonsData } from '@/lib/analyticsData';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const availableVehicles = sampleVehicles.filter((v) => v.status === 'Available');
const delayedDeliveries = sampleDeliveries.filter((d) => d.status === 'Delayed');
const inTransit = sampleDeliveries.filter((d) => d.status === 'In Transit');

const includes = (q: string, ...keys: string[]) =>
  keys.some((k) => q.includes(k));

export function getAssistantResponse(question: string): string {
  const q = question.toLowerCase().trim();

  if (includes(q, 'safest', 'safe route', 'safest route') && includes(q, 'tawang')) {
    return 'Route B (Valley Corridor) is currently the safest route to Tawang, with a risk score of 22/100 and an accessibility score of 86/100. It provides the best balance of safety, travel time and cost. I would recommend it over Route A, which has a high risk score of 72/100 due to mountain pass conditions.';
  }

  if (includes(q, 'safest', 'safe route') && includes(q, 'imphal')) {
    return 'For Imphal, the Guwahati → Imphal corridor via the valley route is currently the safest option with a medium risk score of 52/100. Weather and connectivity are the main risk factors to monitor along this corridor.';
  }

  if (includes(q, 'high risk', 'which route', 'routes have') && includes(q, 'risk')) {
    return 'There are currently 3 high-risk corridors: Tawang Corridor (78/100 — High), Imphal–Moreh Corridor (52/100 — Medium), and Aizawl Route (28/100 — Low). The Tawang Corridor requires the most active monitoring due to landslide and weather risks.';
  }

  if (includes(q, 'tawang') && includes(q, 'risk')) {
    return 'The Tawang Corridor has a high risk score of 78/100. The main risk factors are weather (heavy rainfall), landslide potential, and road blockage near Sela Pass. I recommend monitoring conditions before dispatch and considering the Valley Corridor as an alternative.';
  }

  if (includes(q, 'delayed', 'delay')) {
    const count = Math.max(delayedDeliveries.length, 5);
    const reasons = delayReasonsData
      .slice(0, 3)
      .map((d) => d.reason.toLowerCase())
      .join(', ');
    return `There are currently ${count} delayed deliveries. The main delay reasons are ${reasons}. I recommend reviewing the affected routes and considering alternative corridors where delay risk is lower.`;
  }

  if (includes(q, 'available', 'vehicle') || includes(q, 'which vehicle')) {
    const names = availableVehicles.map((v) => v.id).join(' and ');
    return `${names} are currently available. TRK-101 is a 4x4 (500 kg capacity) stationed at Guwahati, and TRK-104 is a Van (700 kg capacity) at Gangtok. For difficult terrain like the Tawang corridor, I recommend the 4x4.`;
  }

  if (includes(q, 'reduce', 'delay') || includes(q, 'how can i')) {
    return 'To reduce delivery delays, I recommend: (1) Use the Valley Corridor (Route B) where delay risk is lowest, (2) Dispatch 4x4 vehicles for mountain routes, (3) Monitor weather alerts before dispatch, and (4) Keep buffer time for connectivity blackspots. Following these steps can reduce delay risk by up to 28%.';
  }

  if (includes(q, 'eta', 'travel time', 'how long')) {
    return 'The average ETA across active deliveries is 6h 42m. Route A (Direct Mountain Pass) averages 6h 40m, Route B (Valley Corridor) averages 7h 15m, and Route C (Lowland Detour) averages 8h 05m. Emergency deliveries should prioritize the fastest safe route.';
  }

  if (includes(q, 'cost', 'cheapest', 'expensive')) {
    return 'Estimated costs vary by route: Route A is approximately ₹8,900, Route B is ₹7,850, and Route C is ₹6,900. Route C is the most economical but has a medium risk score of 45/100. For cost-sensitive shipments on Normal priority, Route B offers the best cost-to-safety ratio.';
  }

  if (includes(q, 'weather')) {
    return 'Current weather alerts: Heavy rainfall detected at Tawang, which increases landslide and road blockage risk. The Tawang Corridor should be avoided for non-urgent deliveries until conditions improve. Shillong and Imphal corridors have moderate weather risk.';
  }

  if (includes(q, '4x4', 'vehicle type', 'recommend') && includes(q, 'terrain')) {
    return 'For difficult terrain in the North-East, 4x4 vehicles are strongly recommended. They have the highest accessibility rating and can navigate steep gradients, narrow passes, and uneven surfaces. Trucks should be reserved for flatter, well-maintained corridors like the Guwahati–Shillong route.';
  }

  if (includes(q, 'in transit', 'active')) {
    return `There are currently ${inTransit.length} deliveries in transit. The most active corridors are Guwahati → Tawang and Aizawl → Agartala. All in-transit deliveries are being monitored for risk changes.`;
  }

  if (includes(q, 'accessibility')) {
    return 'Accessibility scores by region: Gangtok 91/100 (highest), Shillong 88/100, Guwahati 84/100, Agartala 82/100, Aizawl 79/100, Itanagar 76/100, Imphal 74/100, and Tawang 58/100 (lowest). Routes through low-accessibility regions require 4x4 vehicles and additional buffer time.';
  }

  if (includes(q, 'emergency', 'urgent', 'medical')) {
    return 'For emergency medical deliveries, I recommend prioritizing safety and ETA over cost. Route B (Valley Corridor) with a 4x4 vehicle is typically the best choice — it has the lowest risk score (22/100) while still being reasonably fast at 7h 15m. Avoid Route A for emergency shipments due to its high risk profile.';
  }

  if (includes(q, 'hello', 'hi', 'hey') || q === '') {
    return 'Hello! I am NER-LINK AI Assistant. I can help you with route recommendations, delivery risks, ETA and logistics insights. Try asking about the safest route to Tawang, delayed deliveries, or available vehicles.';
  }

  if (includes(q, 'help', 'what can you')) {
    return 'I can help with: route recommendations and comparisons, risk assessments for specific corridors, delivery status and delay information, vehicle availability and recommendations, ETA and cost estimates, and accessibility intelligence for NER regions. Just ask a question about your logistics operations.';
  }

  return 'I can help with routes, risks, deliveries, vehicles, ETA, costs and accessibility across the NER logistics network. Try asking: "What is the safest route to Tawang?", "Show delayed deliveries", or "Which vehicle is available?"';
}

export const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hello! I am NER-LINK AI Assistant. I can help you with route recommendations, delivery risks, ETA and logistics insights.',
};

export const quickQuestions = [
  'What is the safest route to Tawang?',
  'Which routes have high risk?',
  'Show delayed deliveries',
  'Which vehicle is available?',
  'How can I reduce delivery delays?',
];
