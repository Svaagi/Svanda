import { JUKEBOX_CONFIG_SWATCHES } from '@svanda/shared';
import { HEX_COLOR_MAX_LENGTH } from 'constants/configurator';
import { type CSSProperties, type KeyboardEvent, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { ControlCaption, Input, useToast } from 'ui';
import { childTestId } from 'utils';

import styles from './controls.module.css';
import { formatHex } from './hexInput';
import { useHexDraft } from './useHexDraft';

export type ColorControlProps = {
  label: string;
  hint?: string;
  value: string;
  hasSwatches: boolean;
  onValueChange: (value: string) => void;
  testId: string;
};

// A native colour picker beside a hex field. The field applies on Enter or when it loses
// focus; anything but six hex digits reverts it and says why.
export function ColorControl({
  label,
  hint,
  value,
  hasSwatches,
  onValueChange,
  testId,
}: ColorControlProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const pickerId = useId();
  const hintId = `${pickerId}hint`;

  const { draft, setDraft, commitDraft } = useHexDraft(
    value,
    onValueChange,
    () => showToast(t('configurator.toasts.invalidHex')),
  );

  const handleHexKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commitDraft();
  };

  return (
    <div className={styles.row} data-testid={testId}>
      <ControlCaption
        label={label}
        hint={hint}
        hintId={hintId}
        htmlFor={pickerId}
        testId={testId}
      />
      <div className={styles.color}>
        <input
          id={pickerId}
          type="color"
          className={styles.picker}
          value={value}
          onChange={(event) => onValueChange(event.currentTarget.value)}
          aria-describedby={hint ? hintId : undefined}
          data-testid={childTestId(testId, 'picker')}
        />
        <Input
          variant="code"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          maxLength={HEX_COLOR_MAX_LENGTH}
          spellCheck={false}
          autoComplete="off"
          aria-label={t('configurator.controls.hexLabel', { label })}
          onBlur={commitDraft}
          onKeyDown={handleHexKeyDown}
          testId={childTestId(testId, 'hex')}
        />
      </div>
      {hasSwatches && (
        <div
          className={styles.swatches}
          role="group"
          aria-label={label}
          data-testid={childTestId(testId, 'swatches')}
        >
          {JUKEBOX_CONFIG_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              className={styles.swatch}
              style={{ '--swatch-color': swatch } as CSSProperties}
              aria-label={t('configurator.controls.swatchLabel', {
                label,
                colour: formatHex(swatch),
              })}
              aria-pressed={swatch === value}
              onClick={() => onValueChange(swatch)}
              data-testid={childTestId(testId, `swatch-${swatch.slice(1)}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
