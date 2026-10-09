import { useEffect, useMemo } from 'react';
import type { Color } from 'three';

import {
  createJukeboxMaterials,
  disposeJukeboxMaterials,
  type JukeboxMaterials,
} from './jukeboxMaterials';

// R3F only disposes what it renders itself; materials assigned onto a loaded model are ours
// to dispose.
export function useJukeboxMaterials(
  shell: Color,
  glass: Color,
): JukeboxMaterials {
  const materials = useMemo(
    () => createJukeboxMaterials({ shell, glass }),
    [shell, glass],
  );

  useEffect(() => () => disposeJukeboxMaterials(materials), [materials]);

  return materials;
}
