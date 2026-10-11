import * as RadixSwitch from '@radix-ui/react-switch';
import { useId } from 'react';
import { ControlCaption } from 'ui/controlCaption';
import { childTestId } from 'utils';

import styles from './switch.module.css';

export interface SwitchProps {
  label: string;
  // A short explanation under the label, read as the switch's description.
  hint?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (isChecked: boolean) => void;
  disabled?: boolean;
  testId?: string;
}

export function Switch({
  label,
  hint,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  testId = 'switch',
}: SwitchProps) {
  const controlId = useId();
  const hintId = `${controlId}hint`;

  return (
    <div className={styles.switch} data-testid={testId}>
      <ControlCaption
        label={label}
        hint={hint}
        hintId={hintId}
        htmlFor={controlId}
        testId={testId}
      />
      <RadixSwitch.Root
        id={controlId}
        aria-describedby={hint ? hintId : undefined}
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
