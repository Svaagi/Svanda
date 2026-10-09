import * as RadixSwitch from '@radix-ui/react-switch';
import { useId } from 'react';
import { childTestId } from 'utils';

import styles from './switch.module.css';

export interface SwitchProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (isChecked: boolean) => void;
  disabled?: boolean;
  testId?: string;
}

export function Switch({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  testId = 'switch',
}: SwitchProps) {
  const controlId = useId();

  return (
    <div className={styles.switch} data-testid={testId}>
      <label
        htmlFor={controlId}
        className={styles.label}
        data-testid={childTestId(testId, 'label')}
      >
        {label}
      </label>
      <RadixSwitch.Root
        id={controlId}
        className={styles.track}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        data-testid={childTestId(testId, 'control')}
      >
        <RadixSwitch.Thumb className={styles.thumb} />
      </RadixSwitch.Root>
    </div>
  );
}
