import React from 'react';
import {
  HardDrive,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Map,
  ShieldCheck,
  Globe,
  Database
} from 'lucide-react';
import { useOffline } from '@/lib/offline/OfflineContext';

export default function OfflineMapManager() {
  const {
    offlineDataAvailable,
    storedSizeMB,
    lastUpdated,
    cachedTilesCount,
    isUpdatingData,
    updateProgress,
    downloadOfflineData,
    deleteOfflineData,
    effectiveOffline,
  } = useOffline();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Offline Map Management</h3>
            <p className="text-xs text-slate-500">
              Manage pre-stored maps and local spatial cache for North-East India.
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            offlineDataAvailable
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {offlineDataAvailable ? 'Status: Available Offline' : 'Status: Data Missing'}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-teal-600" /> Target Region
          </p>
          <p className="mt-1 text-base font-bold text-slate-900">North-East India (NER)</p>
          <p className="mt-0.5 text-xs text-slate-500">8 States · 10 Prime Cities</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-blue-600" /> Stored Data Size
          </p>
          <p className="mt-1 text-base font-bold text-slate-900">
            {storedSizeMB} MB
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{cachedTilesCount} local map tiles stored</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Offline Availability
          </p>
          <p className="mt-1 text-base font-bold text-emerald-700">
            {offlineDataAvailable ? 'Ready for 100% Offline' : 'Not Ready'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">IndexedDB &amp; Vector Cache</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-purple-600" /> Last Updated
          </p>
          <p className="mt-1 text-base font-bold text-slate-900">{lastUpdated}</p>
          <p className="mt-0.5 text-xs text-slate-500">Auto-synced locally</p>
        </div>
      </div>

      {isUpdatingData && (
        <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-800">
            <span>Caching NER Vector Map Tiles &amp; Spatial Boundaries...</span>
            <span>{updateProgress}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-teal-200">
            <div
              className="h-full bg-teal-600 transition-all duration-300"
              style={{ width: `${updateProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={downloadOfflineData}
            disabled={isUpdatingData}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            {isUpdatingData ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Update Offline Data
          </button>

          <button
            type="button"
            onClick={deleteOfflineData}
            disabled={isUpdatingData || !offlineDataAvailable}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete Offline Data
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Preloaded dataset covering Assam, Arunachal, Meghalaya, Manipur, Mizoram, Nagaland, Tripura &amp; Sikkim.
        </p>
      </div>
    </div>
  );
}
