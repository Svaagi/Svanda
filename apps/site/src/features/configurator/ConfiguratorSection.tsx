import {
  CONFIGURATOR_OPEN_GROUP_COUNT,
  CONFIGURATOR_SHEET_QUERY,
} from 'constants/configurator';
import { useMediaQuery } from 'hooks';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VisuallyHidden } from 'ui';

import styles from './configuratorSection.module.css';
import { ConfiguratorSheet } from './ConfiguratorSheet';
import { ConfiguratorSwitches } from './ConfiguratorSwitches';
import { CONFIG_GROUPS, useConfiguratorHydration } from './model';
import { ConfiguratorPanels } from './panels';
import { FlatConfiguratorScreen } from './screen';

// Both designs share the group ids, so the open groups survive a design switch.
const INITIAL_OPEN_GROUPS = CONFIG_GROUPS.pixel
  .slice(0, CONFIGURATOR_OPEN_GROUP_COUNT)
  .map((group) => group.id);

export type ConfiguratorSectionProps = {
  testId?: string;
};

// The custom page: section and design switches above the live screen (projected onto the
// jukebox display, or standing flat while there is none) and the controls in columns beside it, or in a bottom sheet on small
// screens. The prerendered page shows the columns; small screens switch after mount.
export function ConfiguratorSection({
  testId = 'configurator-section',
}: ConfiguratorSectionProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const isSheetLayout = useMediaQuery(CONFIGURATOR_SHEET_QUERY);
  const [openGroups, setOpenGroups] = useState<string[]>(INITIAL_OPEN_GROUPS);
  useConfiguratorHydration();
  const panelProps = { openGroups, onOpenGroupsChange: setOpenGroups };

  return (
    <section
      className={styles.configuratorSection}
      aria-labelledby={headingId}
      data-testid={testId}
    >
      <h2 id={headingId}>
        <VisuallyHidden>{t('custom.configuratorLabel')}</VisuallyHidden>
      </h2>
      <ConfiguratorSwitches />
      {isSheetLayout ? (
        <>
          <FlatConfiguratorScreen layout="sheet" />
          <ConfiguratorSheet>
            {(close) => (
              <ConfiguratorPanels
                layout="sheet"
                {...panelProps}
                onAttach={close}
              />
            )}
          </ConfiguratorSheet>
        </>
      ) : (
        <div className={styles.columns}>
          <ConfiguratorPanels layout="columns" {...panelProps} />
          <FlatConfiguratorScreen layout="columns" />
        </div>
      )}
    </section>
  );
}
