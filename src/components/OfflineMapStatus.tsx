import React from 'react';
import { Wifi, WifiOff, HardDrive, Map, RefreshCw } from 'lucide-react';
import { useOffline } from '@/lib/offline/OfflineContext';

interface OfflineMapStatusProps {
  onToggleOfflineMode?: () => void;
}

export default function OfflineMapStatus({ onToggleOfflineMode }: OfflineMapStatusProps) {
  const {
    effectiveOffline,
    offlineMapMode,
    setOfflineMapMode,
    storedSizeMB,
    lastUpdated,
    toggleForceOffline,
  } = useOffline();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            effectiveOffline ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {effectiveOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              {effectiveOffline
                ? 'Offline Mode – Using locally stored map data'
                : 'Online Mode – Live Map Data Connected'}
            </span>
            <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200">
              NER Region ({storedSizeMB} MB)
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Preloaded offline vector tiles &amp; GeoJSON boundaries active · Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOfflineMapMode(!offlineMapMode)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            offlineMapMode
              ? 'bg-teal-600 text-white shadow-sm hover:bg-teal-700'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Map className="h-3.5 w-3.5" />
          {offlineMapMode ? 'Offline Map Active' : 'Switch to Offline Map'}
        </button>

        <button
          type="button"
          onClick={toggleForceOffline}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
          title="Simulate network disconnection for testing"
        >
          <RefreshCw className="h-3 w-3" />
          {effectiveOffline ? 'Go Online' : 'Simulate Offline'}
        </button>
      </div>
    </div>
  );
}
