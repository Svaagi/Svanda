import { describe, expect, it } from 'vitest';

import { hashMessage } from './hashMessage';

describe('hashMessage', () => {
  it('matches the FNV-1a reference values', () => {
    expect(hashMessage('')).toBe('811c9dc5');
    expect(hashMessage('a')).toBe('e40c292c');
    expect(hashMessage('foobar')).toBe('bf9cf968');
  });

  it('is stable, fixed length and never contains the message', () => {
    const message = 'Cannot read jana@example.com';

    expect(hashMessage(message)).toBe(hashMessage(message));
    expect(hashMessage(message)).toMatch(/^[0-9a-f]{8}$/);
    expect(hashMessage(message)).not.toBe(hashMessage(`${message}!`));
  });
});
