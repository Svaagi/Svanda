import { childTestId } from 'utils';

import styles from './controlCaption.module.css';

export interface ControlCaptionProps {
  label: string;
  // A short explanation under the label; the control points `aria-describedby` at `hintId`.
  hint?: string;
  hintId: string;
  // The native control the label points at; without one the label is plain text and the
  // control carries the same name itself.
  htmlFor?: string;
  // The owning control's test id: the caption marks its parts `<testId>-caption`,
  // `<testId>-label` and `<testId>-hint`.
  testId?: string;
}

// The label and optional hint shown beside a form control.
export function ControlCaption({
  label,
  hint,
  hintId,
  htmlFor,
  testId = 'control',
}: ControlCaptionProps) {
  const labelTestId = childTestId(testId, 'label');

  return (
    <div
      className={styles.caption}
      data-testid={childTestId(testId, 'caption')}
    >
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className={styles.label}
          data-testid={labelTestId}
        >
          {label}
        </label>
      ) : (
        <span className={styles.label} data-testid={labelTestId}>
          {label}
        </span>
      )}
      {hint && (
        <p
          id={hintId}
          className={styles.hint}
          data-testid={childTestId(testId, 'hint')}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
