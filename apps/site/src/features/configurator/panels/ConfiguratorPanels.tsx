import { CONFIGURATOR_START_COLUMN_GROUP_COUNT } from 'constants/configurator';
import { useTranslation } from 'react-i18next';
import { Switch } from 'ui';
import { childTestId } from 'utils';

import { ConfiguratorActions } from '../actions';
import type { AnyConfigGroup } from '../controls';
import { CONFIG_GROUPS, useConfiguratorStore } from '../model';
import { ConfigGroupList } from './ConfigGroupList';
import { EditingBadge } from './EditingBadge';
import styles from './panels.module.css';

export type ConfiguratorPanelsProps = {
  // Framed columns beside the screen, or stacked inside the bottom sheet.
  layout: 'columns' | 'sheet';
  openGroups: string[];
  onOpenGroupsChange: (openGroups: string[]) => void;
  onAttach?: () => void;
  testId?: string;
};

// The two control panels: background and effects first, then buttons, the song list, the
// payment preview and the actions. Columns beside the screen on desktop, stacked in the
// bottom sheet on small screens.
export function ConfiguratorPanels({
  layout,
  openGroups,
  onOpenGroupsChange,
  onAttach,
  testId = 'configurator-panels',
}: ConfiguratorPanelsProps) {
  const { t } = useTranslation();
  const groups: readonly AnyConfigGroup[] = useConfiguratorStore(
    (state) => CONFIG_GROUPS[state.design],
  );
  const isPaymentModalShown = useConfiguratorStore(
    (state) => state.isPaymentModalShown,
  );
  const setPaymentModalShown = useConfiguratorStore(
    (state) => state.setPaymentModalShown,
  );
  const groupListProps = { openGroups, onOpenGroupsChange };

  return (
    <>
      <aside
        className={styles.panel}
        aria-label={t('configurator.panels.backgroundAndEffects')}
        data-layout={layout}
        data-wheel-scroll=""
        data-testid={childTestId(testId, 'start')}
      >
        <EditingBadge testId={childTestId(testId, 'editing')} />
        <ConfigGroupList
          groups={groups.slice(0, CONFIGURATOR_START_COLUMN_GROUP_COUNT)}
          {...groupListProps}
          testId={childTestId(testId, 'start-groups')}
        />
      </aside>
      <aside
        className={`${styles.panel} ${styles.endPanel}`}
        aria-label={t('configurator.panels.buttonsAndList')}
        data-layout={layout}
        data-wheel-scroll=""
        data-testid={childTestId(testId, 'end')}
      >
        <ConfigGroupList
          groups={groups.slice(CONFIGURATOR_START_COLUMN_GROUP_COUNT)}
          {...groupListProps}
          testId={childTestId(testId, 'end-groups')}
        />
        <div className={styles.option}>
          <Switch
            label={t('configurator.showPayment')}
            checked={isPaymentModalShown}
            onCheckedChange={setPaymentModalShown}
            testId={childTestId(testId, 'payment')}
          />
        </div>
        <ConfiguratorActions
          onAttach={onAttach}
          testId={childTestId(testId, 'actions')}
        />
      </aside>
    </>
  );
}
