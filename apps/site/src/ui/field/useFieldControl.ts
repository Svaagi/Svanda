import { type AriaAttributes, useContext } from 'react';

import { FieldContext } from './fieldContext';

export function joinIds(
  ...ids: (string | false | undefined)[]
): string | undefined {
  const joined = ids.filter(Boolean).join(' ');
  return joined || undefined;
}

interface FieldControlProps {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
}

export function useFieldControl(own: FieldControlProps): FieldControlProps {
  const field = useContext(FieldContext);
  if (!field) return own;

  return {
    id: field.controlId,
    'aria-describedby': joinIds(own['aria-describedby'], field.describedBy),
    'aria-invalid': field.isInvalid || own['aria-invalid'],
  };
}
