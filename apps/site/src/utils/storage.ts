// Storage access throws in some private modes and when site data is blocked; callers treat
// that exactly like an empty or read-only store.

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The choice still applies for this page view; it just is not remembered.
  }
}
