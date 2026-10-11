import type { ConfigRange } from '@svanda/shared';
import { useLocale } from 'i18n';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { ControlCaption, Slider } from 'ui';
import { childTestId } from 'utils';

import type { RangeFormat } from '../model';
import styles from './controls.module.css';
import { formatRangeNumber } from './rangeFormat';

export type RangeControlProps = {
  label: string;
  hint?: string;
  value: number;
  range: ConfigRange;
  format: RangeFormat;
  onValueChange: (value: number) => void;
  testId: string;
};

export function RangeControl({
  label,
  hint,
  value,
  range,
  format,
  onValueChange,
  testId,
}: RangeControlProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const hintId = useId();
  const valueText = t(`configurator.formats.${format}`, {
    value: formatRangeNumber(value, format, locale),
  });

  return (
    <div className={styles.row} data-testid={testId}>
      <ControlCaption
        label={label}
        hint={hint}
        hintId={hintId}
        testId={testId}
      />
      <div className={styles.range}>
        <Slider
          label={label}
          value={value}
          min={range.min}
          max={range.max}
          step={range.step}
          valueText={valueText}
          describedBy={hint ? hintId : undefined}
          onValueChange={onValueChange}
          testId={childTestId(testId, 'slider')}
        />
        {/* The slider announces the same text, so this is for sighted readers only. */}
        <output
          className={styles.output}
          aria-hidden="true"
          data-testid={childTestId(testId, 'value')}
        >
          {valueText}
        </output>
      </div>
    </div>
  );
}
