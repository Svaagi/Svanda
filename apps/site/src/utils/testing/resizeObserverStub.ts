import { vi } from 'vitest';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom has no ResizeObserver, which Radix measures some parts with. Undo with
// `vi.unstubAllGlobals()`.
export function stubResizeObserver() {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
}
