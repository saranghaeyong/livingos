import { DEFAULT_APP_SHORTCUTS, DEFAULT_SETTINGS, PRESET_WALLPAPERS } from '../constants';
import { AppShortcut, UserSettings, Wallpaper } from '../types';

const SETTINGS_KEY = 'livingos_tv_settings_v1';
const SHORTCUTS_KEY = 'livingos_tv_shortcuts_v1';
const DB_NAME = 'livingos_tv_db';
const DB_VERSION = 1;
const WALLPAPER_STORE = 'custom_wallpapers';

// Open or initialize IndexedDB for high-res family photos
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(WALLPAPER_STORE)) {
        db.createObjectStore(WALLPAPER_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.warn('Failed to load settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage', e);
  }
}

export function loadShortcuts(): AppShortcut[] {
  try {
    const raw = localStorage.getItem(SHORTCUTS_KEY);
    if (!raw) return DEFAULT_APP_SHORTCUTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_APP_SHORTCUTS;
  } catch (e) {
    console.warn('Failed to load shortcuts from localStorage', e);
    return DEFAULT_APP_SHORTCUTS;
  }
}

export function saveShortcuts(shortcuts: AppShortcut[]): void {
  try {
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
  } catch (e) {
    console.warn('Failed to save shortcuts to localStorage', e);
  }
}

export async function getCustomWallpapers(): Promise<Wallpaper[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(WALLPAPER_STORE, 'readonly');
      const store = transaction.objectStore(WALLPAPER_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        console.warn('Failed to fetch custom wallpapers from IndexedDB');
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('IndexedDB not accessible, falling back to empty list', err);
    return [];
  }
}

export async function saveCustomWallpaper(file: File, title?: string): Promise<Wallpaper> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const id = 'custom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newWallpaper: Wallpaper = {
        id,
        title: title || file.name.replace(/\.[^/.]+$/, '').slice(0, 28) || 'Family Photo',
        subtitle: `Added ${new Date().toLocaleDateString()}`,
        url: dataUrl,
        thumbnailUrl: dataUrl,
        isCustom: true,
        dateAdded: Date.now(),
      };

      try {
        const db = await openDB();
        const transaction = db.transaction(WALLPAPER_STORE, 'readwrite');
        const store = transaction.objectStore(WALLPAPER_STORE);
        store.put(newWallpaper);

        transaction.oncomplete = () => {
          resolve(newWallpaper);
        };
        transaction.onerror = () => {
          reject(transaction.error);
        };
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function deleteCustomWallpaper(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(WALLPAPER_STORE, 'readwrite');
      const store = transaction.objectStore(WALLPAPER_STORE);
      store.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Failed to delete custom wallpaper', err);
  }
}

export async function getAllWallpapers(): Promise<Wallpaper[]> {
  const custom = await getCustomWallpapers();
  return [...PRESET_WALLPAPERS, ...custom];
}
