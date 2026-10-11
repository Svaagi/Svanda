import type { JukeboxCssLabels } from '@svanda/shared';
import { useTranslation } from 'react-i18next';

import { useConfiguratorStore } from './model';

// Translated names of what is being edited: the design, the section and both together
// (`Pixel · Karaoke`), plus the labels the CSS export writes above each block.
export function useEditingNames() {
  const { t } = useTranslation();
  const design = useConfiguratorStore((state) => state.design);
  const section = useConfiguratorStore((state) => state.section);
  const designName = t(`configurator.design.${design}`);
  const cssLabels: JukeboxCssLabels = {
    design: designName,
    sections: {
      sing: t('configurator.section.sing'),
      listen: t('configurator.section.listen'),
    },
  };

  return {
    designName,
    target: t('configurator.editingTarget', {
      design: designName,
      section: t(`configurator.section.${section}`),
    }),
    cssLabels,
  };
}
