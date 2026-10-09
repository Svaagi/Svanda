import { CONFIGURATOR_CHANGE_DEBOUNCE_MS } from 'constants/analytics';
import { track } from 'lib/analytics';
import { useEffect } from 'react';
import { debounce } from 'utils';

import { useConfiguratorStore } from './configuratorStore';

const reportChange = () => {
  const { design, section } = useConfiguratorStore.getState();
  track('configurator_change', { design, section });
};

// One change event per burst of edits (a drag, typing a hex, a reset or an import), naming
// the design and section edited last. A pending report is sent when the section unmounts.
export function useConfiguratorChangeTracking() {
  useEffect(() => {
    const report = debounce(reportChange, CONFIGURATOR_CHANGE_DEBOUNCE_MS);
    const unsubscribe = useConfiguratorStore.subscribe(
      ({ config }, previous) => {
        // Restoring the stored configuration is not an edit.
        if (
          config !== previous.config &&
          useConfiguratorStore.persist.hasHydrated()
        )
          report();
      },
    );

    return () => {
      unsubscribe();
      report.flush();
    };
  }, []);
}
