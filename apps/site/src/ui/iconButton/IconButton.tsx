import type { ComponentPropsWithRef, ReactNode } from 'react';

import styles from './iconButton.module.css';

export interface IconButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'className' | 'style' | 'children' | 'aria-label'
> {
  label: string;
  children: ReactNode;
  testId?: string;
}

export function IconButton({
  label,
  children,
  type = 'button',
  testId = 'icon-button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={styles.iconButton}
      aria-label={label}
      data-testid={testId}
      {...rest}
    >
      {children}
    </button>
  );
}
