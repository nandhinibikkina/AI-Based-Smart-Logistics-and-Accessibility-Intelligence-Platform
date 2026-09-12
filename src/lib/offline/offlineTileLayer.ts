import L from 'leaflet';
import { getCachedTile, saveCachedTile, generateNERVectorTile } from './offlineStorage';

// Custom Leaflet TileLayer subclass for offline-first map rendering
export const OfflineTileLayer = L.TileLayer.extend({
  options: {
    isOffline: false,
  },

  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const tile = document.createElement('img');
    tile.alt = 'Map Tile';
    tile.setAttribute('role', 'presentation');

    const { x, y, z } = coords;
    const key = `${z}/${x}/${y}`;
    const url = this.getTileUrl(coords);

    const isOfflineMode = this.options.isOffline;

    if (isOfflineMode) {
      // 100% Offline mode: Check IndexedDB cache first
      getCachedTile(key).then((cached) => {
        if (cached) {
          tile.src = cached;
          done(undefined, tile);
        } else {
          // Render vector-canvas fallback tile for NER region
          const vectorDataUrl = generateNERVectorTile(z, x, y);
          tile.src = vectorDataUrl;
          done(undefined, tile);
        }
      });
    } else {
      // Online mode: Fetch from OSM and cache in background into IndexedDB
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            tile.src = dataUrl;
            done(undefined, tile);
            // Save to IndexedDB in background
            saveCachedTile(key, dataUrl);
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => {
          // If fetch fails (network lost mid-session), fall back to offline cache or vector tile
          getCachedTile(key).then((cached) => {
            if (cached) {
              tile.src = cached;
              done(undefined, tile);
            } else {
              tile.src = generateNERVectorTile(z, x, y);
              done(undefined, tile);
            }
          });
        });
    }

    return tile;
  },
});

export function createOfflineTileLayer(urlPattern: string, options: any) {
  return new (OfflineTileLayer as any)(urlPattern, options);
}
