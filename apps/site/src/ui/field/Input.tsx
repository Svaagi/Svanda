import type { ComponentPropsWithRef } from 'react';

import styles from './field.module.css';
import { useFieldControl } from './useFieldControl';

export interface InputProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'className' | 'style'
> {
  testId?: string;
}

export function Input({
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
      className={styles.control}
      data-testid={testId}
      {...rest}
      {...controlProps}
    />
  );
}
