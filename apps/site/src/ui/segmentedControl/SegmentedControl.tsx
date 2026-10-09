import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { childTestId } from 'utils';

import styles from './segmentedControl.module.css';

export interface SegmentedControlOption<Value extends string> {
  value: Value;
  label: string;
}

export interface SegmentedControlProps<Value extends string> {
  label: string;
  options: readonly SegmentedControlOption<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  testId?: string;
}

export function SegmentedControl<Value extends string>({
  label,
  options,
  value,
  onValueChange,
  testId = 'segmented-control',
}: SegmentedControlProps<Value>) {
  // Radix reports '' when the pressed item is pressed again; a segmented control always
  // keeps one option selected, so anything that is not an option is ignored.
  const handleValueChange = (nextValue: string) => {
    const option = options.find((candidate) => candidate.value === nextValue);
    if (option) onValueChange(option.value);
  };

  return (
    <ToggleGroup.Root
      type="single"
      className={styles.segmentedControl}
      aria-label={label}
      value={value}
      onValueChange={handleValueChange}
      data-testid={testId}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className={styles.option}
          data-testid={childTestId(testId, option.value)}
        >
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
