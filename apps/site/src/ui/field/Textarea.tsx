import type { ComponentPropsWithRef } from 'react';

import styles from './field.module.css';
import { useFieldControl } from './useFieldControl';

export interface TextareaProps extends Omit<
  ComponentPropsWithRef<'textarea'>,
  'className' | 'style'
> {
  testId?: string;
}

export function Textarea({
  id,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  testId = 'textarea',
  ...rest
}: TextareaProps) {
  const controlProps = useFieldControl({
    id,
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid,
  });

  return (
    <textarea
      className={`${styles.control} ${styles.textarea}`}
      data-testid={testId}
      {...rest}
      {...controlProps}
    />
  );
}
