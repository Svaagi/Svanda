import type { ReactNode } from 'react';

import styles from './visuallyHidden.module.css';

export interface VisuallyHiddenProps {
  children: ReactNode;
  testId?: string;
}

export function VisuallyHidden({
  children,
  testId = 'visually-hidden',
}: VisuallyHiddenProps) {
  return (
    <span className={styles.visuallyHidden} data-testid={testId}>
      {children}
    </span>
  );
}
