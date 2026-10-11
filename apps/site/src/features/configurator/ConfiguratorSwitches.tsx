import {
  JUKEBOX_SECTIONS,
  JUKEBOX_UI_DESIGNS,
  type JukeboxSection,
  type JukeboxUiDesign,
} from '@svanda/shared';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from 'ui';
import { childTestId } from 'utils';

import styles from './configuratorSection.module.css';
import { useConfiguratorStore } from './model';

export type ConfiguratorSwitchesProps = {
  testId?: string;
};

// Which section and design the controls edit, above the live screen.
export function ConfiguratorSwitches({
  testId = 'configurator-switches',
}: ConfiguratorSwitchesProps) {
  const { t } = useTranslation();
  const section = useConfiguratorStore((state) => state.section);
  const design = useConfiguratorStore((state) => state.design);
  const setSection = useConfiguratorStore((state) => state.setSection);
  const setDesign = useConfiguratorStore((state) => state.setDesign);
  const sectionOptions = JUKEBOX_SECTIONS.map((value) => ({
    value,
    label: t(`configurator.section.${value}`),
  }));
  const designOptions = JUKEBOX_UI_DESIGNS.map((value) => ({
    value,
    label: t(`configurator.design.${value}`),
  }));

  return (
    <div className={styles.switches} data-testid={testId}>
      <SegmentedControl<JukeboxSection>
        label={t('configurator.section.label')}
        size="compact"
        options={sectionOptions}
        value={section}
        onValueChange={setSection}
        testId={childTestId(testId, 'section')}
      />
      <SegmentedControl<JukeboxUiDesign>
        label={t('configurator.design.label')}
        size="compact"
        options={designOptions}
        value={design}
        onValueChange={setDesign}
        testId={childTestId(testId, 'design')}
      />
    </div>
  );
}
