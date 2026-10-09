// Storage access throws in some private modes and when site data is blocked; callers treat
// that exactly like an empty or read-only store.

type StorageArea = 'localStorage' | 'sessionStorage';

function readArea(area: StorageArea, key: string): string | null {
  try {
    return window[area].getItem(key);
  } catch {
    return null;
  }
}

function writeArea(area: StorageArea, key: string, value: string): void {
  try {
    window[area].setItem(key, value);
  } catch {
    // The choice still applies for this page view; it just is not remembered.
  }
}

function removeFromArea(area: StorageArea, key: string): void {
  try {
    window[area].removeItem(key);
  } catch {
    // Nothing was stored where storage is unavailable.
  }
}

export const readStorage = (key: string) => readArea('localStorage', key);

export const writeStorage = (key: string, value: string) =>
  writeArea('localStorage', key, value);

export const removeStorage = (key: string) =>
  removeFromArea('localStorage', key);

export const readSessionStorage = (key: string) =>
  readArea('sessionStorage', key);

export const writeSessionStorage = (key: string, value: string) =>
  writeArea('sessionStorage', key, value);
