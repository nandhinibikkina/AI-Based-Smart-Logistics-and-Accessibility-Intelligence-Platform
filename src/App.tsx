import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Problem from '@/components/Problem';
import Solution from '@/components/Solution';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';
import Dashboard from '@/pages/Dashboard';
import RoutePlanner from '@/pages/RoutePlanner';
import LiveMapPage from '@/pages/LiveMapPage';
import DeliveryManagement from '@/pages/DeliveryManagement';
import VehicleManagement from '@/pages/VehicleManagement';
import Analytics from '@/pages/Analytics';
import Alerts from '@/pages/Alerts';
import AIAssistant from '@/pages/AIAssistant';
import { useHashRoute } from '@/hooks/useHashRoute';
import { DeliveriesProvider } from '@/store/DeliveriesContext';

export default function App() {
  const route = useHashRoute();

  return (
    <DeliveriesProvider>
      <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <Navbar route={route} />
      <main>
        {route === 'dashboard' ? (
          <Dashboard />
        ) : route === 'route-planner' ? (
          <RoutePlanner />
        ) : route === 'live-map' ? (
          <LiveMapPage />
        ) : route === 'deliveries' ? (
          <DeliveryManagement />
        ) : route === 'vehicles' ? (
          <VehicleManagement />
        ) : route === 'analytics' ? (
          <Analytics />
        ) : route === 'alerts' ? (
          <Alerts />
        ) : route === 'ai-assistant' ? (
          <AIAssistant />
        ) : (
          <>
            <Hero />
            <Problem />
            <Solution />
            <Features />
            <HowItWorks />
          </>
        )}
      </main>
      <Footer />
      </div>
    </DeliveriesProvider>
  );
}
