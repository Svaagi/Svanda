import { useEffect } from 'react';

import { useConfiguratorStore } from './configuratorStore';

// Applies the stored configuration once the configurator has mounted on the client.
export function useConfiguratorHydration() {
  useEffect(() => {
    void useConfiguratorStore.persist.rehydrate();
  }, []);
}
