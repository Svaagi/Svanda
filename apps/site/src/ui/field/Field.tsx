import { type ReactNode, useId, useMemo } from 'react';
import { childTestId } from 'utils';

import styles from './field.module.css';
import { FieldContext, type FieldContextValue } from './fieldContext';
import { joinIds } from './useFieldControl';

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  // One Input or Textarea; it picks up the label, hint and error wiring from context.
  children: ReactNode;
  testId?: string;
}

export function Field({
  label,
  hint,
  error,
  children,
  testId = 'field',
}: FieldProps) {
  const baseId = useId();
  const controlId = `${baseId}control`;
  const hintId = `${baseId}hint`;
  const errorId = `${baseId}error`;

  const contextValue = useMemo<FieldContextValue>(
    () => ({
      controlId,
      describedBy: joinIds(hint && hintId, error && errorId),
      isInvalid: Boolean(error),
    }),
    [controlId, hint, hintId, error, errorId],
  );

  return (
    <div className={styles.field} data-testid={testId}>
      <label
        htmlFor={controlId}
        className={styles.label}
        data-testid={childTestId(testId, 'label')}
      >
        {label}
      </label>
      <FieldContext value={contextValue}>{children}</FieldContext>
      {hint && (
        <p
          id={hintId}
          className={styles.hint}
          data-testid={childTestId(testId, 'hint')}
        >
          {hint}
        </p>
      )}
      {/* Always rendered so the live region exists before an error is announced into it. */}
      <p
        id={errorId}
        className={styles.error}
        aria-live="polite"
        data-testid={childTestId(testId, 'error')}
      >
        {error}
      </p>
    </div>
  );
}
