import React, { useState } from 'react';
import { Wifi, WifiOff, HardDrive, CheckCircle2, RefreshCw, Layers } from 'lucide-react';
import { useOffline } from '@/lib/offline/OfflineContext';

export default function NetworkStatus() {
  const {
    isOnline,
    forceOffline,
    effectiveOffline,
    toggleForceOffline,
    offlineDataAvailable,
    storedSizeMB,
  } = useOffline();

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition-all ${
          effectiveOffline
            ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
            : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
        }`}
        title="Click to view offline network details & toggle offline mode"
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              effectiveOffline ? 'bg-red-400' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              effectiveOffline ? 'bg-red-500' : 'bg-emerald-500'
            }`}
          />
        </span>

        <span className="flex items-center gap-1.5">
          {effectiveOffline ? (
            <>
              <WifiOff className="h-3.5 w-3.5" />
              <span>Offline Mode Active</span>
            </>
          ) : (
            <>
              <Wifi className="h-3.5 w-3.5" />
              <span>Online</span>
            </>
          )}
        </span>

        {forceOffline && (
          <span className="rounded bg-red-200 px-1 py-0.5 text-[10px] uppercase font-bold text-red-800">
            Simulated
          </span>
        )}
      </button>

      {/* Network & Offline Status Dropdown details */}
      {expanded && (
        <div
          className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              System Network Status
            </h4>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Browser Network:</span>
              <span className={`font-semibold ${isOnline ? 'text-emerald-600' : 'text-red-600'}`}>
                {isOnline ? 'Connected (Online)' : 'Disconnected (Offline)'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Map Storage Status:</span>
              <span className="font-semibold text-teal-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                {offlineDataAvailable ? `Ready (${storedSizeMB} MB)` : 'Not Loaded'}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-600">
              {effectiveOffline ? (
                <p className="text-red-700 font-medium">
                  🔴 Offline Mode Active – Local maps are being used.
                </p>
              ) : (
                <p className="text-emerald-700 font-medium">
                  🟢 Online connectivity available. High-resolution tile streaming enabled.
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={toggleForceOffline}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold transition-colors ${
                  forceOffline
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-800 text-white hover:bg-slate-900'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {forceOffline ? 'Switch Back to Online Mode' : 'Test Offline Mode (No Internet)'}
              </button>
              <p className="mt-1.5 text-[11px] text-center text-slate-400">
                Allows testing offline map rendering without disconnecting Wi-Fi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
