import type { ComponentPropsWithRef } from 'react';

import styles from './field.module.css';
import { useFieldControl } from './useFieldControl';

// `code` is a compact monospace field for short codes such as `#RRGGBB`.
type InputVariant = 'text' | 'code';

export interface InputProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'className' | 'style'
> {
  variant?: InputVariant;
  testId?: string;
}

export function Input({
  variant = 'text',
  id,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  testId = 'input',
  ...rest
}: InputProps) {
  const controlProps = useFieldControl({
    id,
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid,
  });

  return (
    <input
      className={
        variant === 'code' ? `${styles.control} ${styles.code}` : styles.control
      }
      data-testid={testId}
      {...rest}
      {...controlProps}
    />
  );
}
