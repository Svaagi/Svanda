import { describe, expect, it } from 'vitest';

import { isPagingKeyTarget, resolveKeyPage } from './keyboardPaging';

const press = (key: string, shiftKey = false) => ({ key, shiftKey });

describe('resolveKeyPage', () => {
  it('moves one page down', () => {
    expect(resolveKeyPage(press('PageDown'), 1)).toBe(2);
    expect(resolveKeyPage(press('ArrowDown'), 1)).toBe(2);
    expect(resolveKeyPage(press(' '), 1)).toBe(2);
  });

  it('moves one page up', () => {
    expect(resolveKeyPage(press('PageUp'), 3)).toBe(2);
    expect(resolveKeyPage(press('ArrowUp'), 3)).toBe(2);
    expect(resolveKeyPage(press(' ', true), 3)).toBe(2);
  });

  it('jumps to the first page and to contact', () => {
    expect(resolveKeyPage(press('Home'), 4)).toBe(0);
    expect(resolveKeyPage(press('End'), 1)).toBe(5);
  });

  it('stays inside the page range', () => {
    expect(resolveKeyPage(press('ArrowUp'), 0)).toBe(0);
    expect(resolveKeyPage(press('ArrowDown'), 5)).toBe(5);
  });

  it('ignores other keys', () => {
    expect(resolveKeyPage(press('ArrowLeft'), 2)).toBeNull();
    expect(resolveKeyPage(press('a'), 2)).toBeNull();
  });
});

describe('isPagingKeyTarget', () => {
  const render = (html: string) => {
    document.body.innerHTML = html;
    return document.body.querySelector('[data-target]');
  };

  it('pages from the document and plain content', () => {
    expect(isPagingKeyTarget(null, 'ArrowDown')).toBe(true);
    expect(isPagingKeyTarget(render('<p data-target></p>'), ' ')).toBe(true);
  });

  it('leaves keys in form fields alone', () => {
    expect(
      isPagingKeyTarget(render('<input data-target />'), 'ArrowDown'),
    ).toBe(false);
    expect(isPagingKeyTarget(render('<textarea data-target />'), ' ')).toBe(
      false,
    );
  });

  it('leaves keys inside a dialog alone', () => {
    const target = render('<div role="dialog"><p data-target></p></div>');

    expect(isPagingKeyTarget(target, 'PageDown')).toBe(false);
  });

  it('lets space activate buttons and links but pages with arrows', () => {
    const button = render('<button data-target></button>');

    expect(isPagingKeyTarget(button, ' ')).toBe(false);
    expect(isPagingKeyTarget(button, 'ArrowDown')).toBe(true);
  });
});
