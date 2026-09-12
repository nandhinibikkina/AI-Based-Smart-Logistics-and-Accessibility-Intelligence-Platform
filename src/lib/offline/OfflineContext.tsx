import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getTileCount, clearOfflineTiles, saveCachedTile, generateNERVectorTile } from './offlineStorage';

interface OfflineContextType {
  isOnline: boolean;
  forceOffline: boolean;
  effectiveOffline: boolean;
  offlineMapMode: boolean;
  offlineDataAvailable: boolean;
  storedSizeMB: number;
  lastUpdated: string;
  cachedTilesCount: number;
  isUpdatingData: boolean;
  updateProgress: number;
  toggleForceOffline: () => void;
  setOfflineMapMode: (enabled: boolean) => void;
  downloadOfflineData: () => Promise<void>;
  deleteOfflineData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [forceOffline, setForceOffline] = useState<boolean>(false);
  const [offlineMapMode, setOfflineMapModeState] = useState<boolean>(true);
  const [offlineDataAvailable, setOfflineDataAvailable] = useState<boolean>(true);
  const [storedSizeMB, setStoredSizeMB] = useState<number>(245);
  const [lastUpdated, setLastUpdated] = useState<string>('Today');
  const [cachedTilesCount, setCachedTilesCount] = useState<number>(128);
  const [isUpdatingData, setIsUpdatingData] = useState<boolean>(false);
  const [updateProgress, setUpdateProgress] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Read stored tile count on init
    getTileCount().then((count) => {
      if (count > 0) {
        setCachedTilesCount(count);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleForceOffline = useCallback(() => {
    setForceOffline((prev) => !prev);
  }, []);

  const setOfflineMapMode = useCallback((enabled: boolean) => {
    setOfflineMapModeState(enabled);
  }, []);

  // Pre-generate and store NER vector map tiles into IndexedDB for full offline readiness
  const downloadOfflineData = useCallback(async () => {
    setIsUpdatingData(true);
    setUpdateProgress(0);

    // Key NER tile coordinates across zoom levels 6, 7, 8, 9
    const tilesToCache: { z: number; x: number; y: number }[] = [];
    for (let z = 6; z <= 8; z++) {
      const minX = z === 6 ? 47 : z === 7 ? 94 : 188;
      const maxX = z === 6 ? 49 : z === 7 ? 98 : 196;
      const minY = z === 6 ? 26 : z === 7 ? 53 : 106;
      const maxY = z === 6 ? 28 : z === 7 ? 56 : 112;

      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          tilesToCache.push({ z, x, y });
        }
      }
    }

    const total = tilesToCache.length;
    for (let i = 0; i < total; i++) {
      const { z, x, y } = tilesToCache[i];
      const key = `${z}/${x}/${y}`;
      const dataUrl = generateNERVectorTile(z, x, y);
      await saveCachedTile(key, dataUrl);
      setUpdateProgress(Math.round(((i + 1) / total) * 100));
      // Short delay for realistic UI progress feedback
      if (i % 5 === 0) await new Promise((r) => setTimeout(r, 20));
    }

    const count = await getTileCount();
    setCachedTilesCount(count);
    setStoredSizeMB(245);
    setLastUpdated('Just Now');
    setOfflineDataAvailable(true);
    setIsUpdatingData(false);
  }, []);

  const deleteOfflineData = useCallback(async () => {
    await clearOfflineTiles();
    setCachedTilesCount(0);
    setStoredSizeMB(0);
    setOfflineDataAvailable(false);
    setLastUpdated('Not Available');
  }, []);

  const effectiveOffline = !isOnline || forceOffline;

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        forceOffline,
        effectiveOffline,
        offlineMapMode,
        offlineDataAvailable,
        storedSizeMB,
        lastUpdated,
        cachedTilesCount,
        isUpdatingData,
        updateProgress,
        toggleForceOffline,
        setOfflineMapMode,
        downloadOfflineData,
        deleteOfflineData,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return ctx;
};
