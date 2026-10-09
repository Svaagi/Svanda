import { describe, expect, it } from 'vitest';

import { dismissToast, enqueueToast } from './toastQueue';

describe('toast queue', () => {
  it('appends new toasts behind the ones already waiting', () => {
    const queue = enqueueToast([{ id: 0, message: 'First' }], {
      id: 1,
      message: 'Second',
    });

    expect(queue.map(({ message }) => message)).toEqual(['First', 'Second']);
  });

  it('removes only the dismissed toast', () => {
    const queue = [
      { id: 0, message: 'First' },
      { id: 1, message: 'Second' },
    ];

    expect(dismissToast(queue, 0)).toEqual([{ id: 1, message: 'Second' }]);
    expect(dismissToast(queue, 7)).toEqual(queue);
  });
});
