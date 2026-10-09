import { describe, expect, it } from 'vitest';

describe('@svanda/shared', () => {
  it('loads the package entry', async () => {
    const sharedModule = await import('./index.js');

    expect(sharedModule).toBeTypeOf('object');
  });
});
