import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, type AccordionItem } from 'ui';

import {
  type AnyConfigControl,
  type AnyConfigGroup,
  ConfigControlField,
} from '../controls';
import { type ConfigValue, useConfiguratorStore } from '../model';
import styles from './panels.module.css';

export type ConfigGroupListProps = {
  groups: readonly AnyConfigGroup[];
  openGroups: string[];
  onOpenGroupsChange: (openGroups: string[]) => void;
  testId: string;
};

// The groups' controls as accordions, bound to the design and section being edited.
export function ConfigGroupList({
  groups,
  openGroups,
  onOpenGroupsChange,
  testId,
}: ConfigGroupListProps) {
  const { t } = useTranslation();
  const settings: Record<string, ConfigValue> = useConfiguratorStore(
    (state) => state.config[state.design][state.section],
  );
  const setValue = useConfiguratorStore((state) => state.setValue);
  const handleValueChange = useCallback(
    (control: AnyConfigControl, value: ConfigValue) => {
      setValue(control.key, value);
    },
    [setValue],
  );

  const items: AccordionItem[] = groups.map((group) => ({
    value: group.id,
    title: t(`configurator.groups.${group.id}`),
    content: (
      <div className={styles.group}>
        {group.controls.map((control) => (
          <ConfigControlField
            key={control.key}
            control={control}
            value={settings[control.key]}
            onValueChange={handleValueChange}
            testId={`configurator-control-${control.key}`}
          />
        ))}
      </div>
    ),
  }));

  return (
    <Accordion
      items={items}
      value={openGroups}
      onValueChange={onOpenGroupsChange}
      testId={testId}
    />
  );
}
