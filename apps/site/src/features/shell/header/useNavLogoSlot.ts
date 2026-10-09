import { NAV_LOGO_CELL_PX } from 'constants/nav';
import { useStageStore } from 'features/stage';
import { type RefObject, useEffect } from 'react';

import { measureNavLogoSlot } from './navLogoSlot';

// Publishes the resting logo position for the intro swarm; measured on mount and resize only.
export function useNavLogoSlot(
  desktopRef: RefObject<HTMLElement | null>,
  mobileRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const publish = () => {
      useStageStore.getState().setNavLogoSlot(
        measureNavLogoSlot([
          { element: desktopRef.current, cellPx: NAV_LOGO_CELL_PX.desktop },
          { element: mobileRef.current, cellPx: NAV_LOGO_CELL_PX.mobile },
        ]),
      );
    };

    publish();
    window.addEventListener('resize', publish);
    return () => {
      window.removeEventListener('resize', publish);
      useStageStore.getState().setNavLogoSlot(null);
    };
  }, [desktopRef, mobileRef]);
}
