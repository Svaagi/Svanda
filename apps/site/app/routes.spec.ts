import { LEGAL_LINKS } from 'constants/legal';
import { LOCALES } from 'constants/locales';
import { describe, expect, it } from 'vitest';

import routes from './routes';

describe('routes', () => {
  it('prerenders every legal page in every locale from one route module', () => {
    LEGAL_LINKS.forEach(({ id, paths }) => {
      LOCALES.forEach((locale) => {
        expect(routes).toContainEqual(
          expect.objectContaining({
            id: `legal-${id}-${locale}`,
            path: paths[locale].slice(1),
            file: 'routes/legal.tsx',
          }),
        );
      });
    });
  });

  it('keeps one home route per locale', () => {
    const homeIds = routes
      .filter(({ file }) => file === 'routes/home.tsx')
      .map(({ id }) => id);

    expect(homeIds).toEqual(LOCALES.map((locale) => `home-${locale}`));
  });

  it('renders the not-found page for any other path', () => {
    expect(routes.at(-1)).toEqual(
      expect.objectContaining({
        id: 'not-found',
        path: '*',
        file: 'routes/notFound.tsx',
      }),
    );
  });
});
