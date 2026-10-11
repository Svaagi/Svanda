import { render, screen } from '@testing-library/react';
import { LocaleProvider } from 'i18n';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';

// Renders the current router location so specs can assert where a navigation went.
const LOCATION_PROBE_TEST_ID = 'location-probe';

function LocationProbe() {
  const { pathname, hash } = useLocation();

  return (
    <output data-testid={LOCATION_PROBE_TEST_ID}>{`${pathname}${hash}`}</output>
  );
}

export function renderAtPath(ui: ReactNode, path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocaleProvider>
        {ui}
        <LocationProbe />
      </LocaleProvider>
    </MemoryRouter>,
  );
}

export function getCurrentLocation() {
  return screen.getByTestId(LOCATION_PROBE_TEST_ID);
}
