import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'ui';

import type { ConfigValue } from '../model';
import type { AnyConfigControl } from './anyConfigControl';
import { ColorControl } from './ColorControl';
import { RangeControl } from './RangeControl';

export type ConfigControlFieldProps = {
  control: AnyConfigControl;
  value: ConfigValue | undefined;
  onValueChange: (control: AnyConfigControl, value: ConfigValue) => void;
  testId: string;
};

type ControlCopy = { label: string; hint?: string };

// One setting rendered by the control its kind needs. A value of the wrong type (never the
// case for a valid config) renders nothing rather than a broken control.
export const ConfigControlField = memo(
  ({ control, value, onValueChange, testId }: ConfigControlFieldProps) => {
    const { t } = useTranslation();
    const copy: ControlCopy = t(`configurator.controls.${control.copyId}`, {
      returnObjects: true,
    });
    const hint = control.hasHint ? copy.hint : undefined;
    const handleValueChange = (nextValue: ConfigValue) =>
      onValueChange(control, nextValue);

    if (control.kind === 'color' && typeof value === 'string') {
      return (
        <ColorControl
          label={copy.label}
          hint={hint}
          value={value}
          hasSwatches={control.hasSwatches}
          onValueChange={handleValueChange}
          testId={testId}
        />
      );
    }
    if (control.kind === 'range' && typeof value === 'number') {
      return (
        <RangeControl
          label={copy.label}
          hint={hint}
          value={value}
          range={control.range}
          format={control.format}
          onValueChange={handleValueChange}
          testId={testId}
        />
      );
    }
    if (control.kind === 'switch' && typeof value === 'boolean') {
      return (
        <Switch
          label={copy.label}
          hint={hint}
          checked={value}
          onCheckedChange={handleValueChange}
          testId={testId}
        />
      );
    }
    return null;
  },
);

ConfigControlField.displayName = 'ConfigControlField';
