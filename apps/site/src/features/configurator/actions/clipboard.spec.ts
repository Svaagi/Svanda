import { afterEach, describe, expect, it, vi } from 'vitest';

import { copyToClipboard } from './clipboard';

describe('copyToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes the text and reports success', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await expect(copyToClipboard('{}')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('{}');
  });

  it('reports failure when the browser refuses', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: () => Promise.reject(new Error('denied')) },
    });

    await expect(copyToClipboard('{}')).resolves.toBe(false);
  });

  it('reports failure without a Clipboard API', async () => {
    vi.stubGlobal('navigator', {});

    await expect(copyToClipboard('{}')).resolves.toBe(false);
  });
});
