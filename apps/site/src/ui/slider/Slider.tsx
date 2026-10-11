import * as RadixSlider from '@radix-ui/react-slider';
import { childTestId } from 'utils';

import styles from './slider.module.css';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
  // How assistive tech reads the value (`42 %` rather than `0.42`).
  valueText?: string;
  // The id of a hint describing the slider.
  describedBy?: string;
  testId?: string;
}

// A single-thumb slider: Radix owns the pointer and keyboard handling (arrows, Page keys,
// Home and End).
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onValueChange,
  valueText,
  describedBy,
  testId = 'slider',
}: SliderProps) {
  const handleValueChange = ([nextValue]: number[]) => {
    if (nextValue !== undefined) onValueChange(nextValue);
  };

  return (
    <RadixSlider.Root
      className={styles.slider}
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={handleValueChange}
      data-testid={testId}
    >
      <RadixSlider.Track className={styles.track}>
        <RadixSlider.Range className={styles.range} />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className={styles.thumb}
        aria-label={label}
        aria-valuetext={valueText}
        aria-describedby={describedBy}
        data-testid={childTestId(testId, 'thumb')}
      />
    </RadixSlider.Root>
  );
}
