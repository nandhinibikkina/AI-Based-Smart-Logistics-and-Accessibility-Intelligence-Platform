// IndexedDB and local storage manager for RouteX AI Offline Map System

const DB_NAME = 'RouteX_OfflineMapDB';
const DB_VERSION = 1;
const TILE_STORE = 'tiles';
const META_STORE = 'meta';

export interface OfflinePackInfo {
  region: string;
  version: string;
  states: string[];
  logisticsHubs: string[];
  locationsCount: number;
  highwaysCount: number;
  storedDataSizeMB: number;
  lastUpdated: string;
  status: 'Available Offline' | 'Downloading' | 'Not Downloaded';
  cachedTilesCount: number;
}

let dbInstance: IDBDatabase | null = null;

export async function openOfflineDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TILE_STORE)) {
        db.createObjectStore(TILE_STORE);
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = (err) => {
      console.error('Failed to open IndexedDB for offline maps', err);
      reject(err);
    };
  });
}

export async function getCachedTile(key: string): Promise<string | null> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(TILE_STORE, 'readonly');
      const store = tx.objectStore(TILE_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result); // Data URL or Blob URL
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveCachedTile(key: string, dataUrl: string): Promise<void> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(TILE_STORE, 'readwrite');
      const store = tx.objectStore(TILE_STORE);
      store.put(dataUrl, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('Could not cache map tile offline:', e);
  }
}

export async function getTileCount(): Promise<number> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(TILE_STORE, 'readonly');
      const store = tx.objectStore(TILE_STORE);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

export async function clearOfflineTiles(): Promise<void> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(TILE_STORE, 'readwrite');
      const store = tx.objectStore(TILE_STORE);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e);
    });
  } catch (e) {
    console.error('Failed to clear tile cache', e);
  }
}

// Generate an offline vector canvas tile for NER coordinates when network tiles are unavailable
export function generateNERVectorTile(z: number, x: number, y: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Calculate approximate latitude / longitude for tile bounds
  const n = Math.pow(2, z);
  const lngMin = (x / n) * 360 - 180;
  const lngMax = ((x + 1) / n) * 360 - 180;
  const latMax = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  const latMin = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI;

  // Check if tile is within NER bounding box (lat 21.5 - 29.5, lng 87.5 - 97.5)
  const isNER = latMax >= 21.0 && latMin <= 30.0 && lngMax >= 87.0 && lngMin <= 98.0;

  if (isNER) {
    // Map terrain background (Subtle topographical slate-teal gradient for NER region)
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#0f172a'); // slate 900
    grad.addColorStop(0.5, '#1e293b'); // slate 800
    grad.addColorStop(1, '#0f766e'); // teal 700 tone
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 128);
    ctx.lineTo(256, 128);
    ctx.moveTo(128, 0);
    ctx.lineTo(128, 256);
    ctx.stroke();

    // Contour mountain hatch lines
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.15)'; // teal tint
    ctx.beginPath();
    for (let i = 20; i < 256; i += 40) {
      ctx.moveTo(0, i);
      ctx.quadraticCurveTo(128, i - 15, 256, i + 10);
    }
    ctx.stroke();

    // Tile border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 256, 256);

    // Offline Tile Badge overlay text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '10px sans-serif';
    ctx.fillText(`NER Offline Tile z${z}`, 8, 20);
    ctx.fillText(`${latMin.toFixed(1)}°, ${lngMin.toFixed(1)}°`, 8, 244);
  } else {
    // Outside NER region - ocean/gray pattern
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.font = '10px sans-serif';
    ctx.fillText('Outside NER Offline Area', 10, 128);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.strokeRect(0, 0, 256, 256);
  }

  return canvas.toDataURL('image/png');
}
