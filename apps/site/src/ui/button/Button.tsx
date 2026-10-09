import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithRef } from 'react';

import styles from './button.module.css';

// `pixel` is a compact bordered label in the pixel font, sized like the language switch.
// `dashed` is a full-width, left-aligned placeholder action inside a form.
type ButtonVariant = 'outline' | 'fill' | 'ghost' | 'pixel' | 'dashed';

export interface ButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'className' | 'style'
> {
  variant?: ButtonVariant;
  asChild?: boolean;
  testId?: string;
}

export function Button({
  variant = 'outline',
  asChild = false,
  type = 'button',
  testId = 'button',
  ...rest
}: ButtonProps) {
  const className = `${styles.button} ${styles[variant]}`;

  if (asChild) {
    return <Slot className={className} data-testid={testId} {...rest} />;
  }

  return (
    <button type={type} className={className} data-testid={testId} {...rest} />
  );
}
