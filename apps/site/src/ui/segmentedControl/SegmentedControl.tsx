import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { childTestId } from 'utils';

import styles from './segmentedControl.module.css';

export interface SegmentedControlOption<Value extends string> {
  value: Value;
  label: string;
}

// `compact` uses a smaller pixel font, for a pair of controls on a narrow screen.
type SegmentedControlSize = 'default' | 'compact';

export interface SegmentedControlProps<Value extends string> {
  label: string;
  size?: SegmentedControlSize;
  options: readonly SegmentedControlOption<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  testId?: string;
}

export function SegmentedControl<Value extends string>({
  label,
  size = 'default',
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
      data-size={size}
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
