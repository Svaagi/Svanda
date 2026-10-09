import { describe, expect, it } from 'vitest';

import { getI18nInstance } from './i18nInstance';

describe('getI18nInstance', () => {
  it('is initialised synchronously with the copy of its locale', () => {
    const instance = getI18nInstance('en');

    expect(instance.isInitialized).toBe(true);
    expect(instance.language).toBe('en');
    expect(instance.t('nav.venues')).toBe('Venues');
  });

  it('serves each locale its own catalog', () => {
    expect(getI18nInstance('cs').t('contact.form.submit')).toBe('ODESLAT');
    expect(getI18nInstance('sk').t('contact.form.submit')).toBe('ODOSLAŤ');
  });

  it('reuses one instance per locale', () => {
    expect(getI18nInstance('sk')).toBe(getI18nInstance('sk'));
    expect(getI18nInstance('sk')).not.toBe(getI18nInstance('cs'));
  });

  it('interpolates without escaping, leaving that to React', () => {
    expect(getI18nInstance('en').t('footer.copyright', { year: 2026 })).toBe(
      '© 2026 SVANDA · Karaoke jukebox',
    );
  });

  it('keeps translator notes out of the resources', () => {
    expect(getI18nInstance('sk').exists('_meta.note')).toBe(false);
  });
});
