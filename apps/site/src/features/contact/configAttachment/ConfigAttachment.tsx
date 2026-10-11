import { useConfiguratorStore } from 'features/configurator';
import { track } from 'lib/analytics';
import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui';
import { childTestId } from 'utils';

import styles from './configAttachment.module.css';

export type ConfigAttachmentProps = {
  testId?: string;
};

export function ConfigAttachment({
  testId = 'config-attachment',
}: ConfigAttachmentProps) {
  const { t } = useTranslation();
  const isAttached = useConfiguratorStore((state) => state.isAttached);
  const setAttached = useConfiguratorStore((state) => state.setAttached);
  const labelId = useId();
  const addRef = useRef<HTMLButtonElement>(null);
  const removeRef = useRef<HTMLButtonElement>(null);
  const hasToggledRef = useRef(false);

  // The pressed button is replaced by the other one; focus follows so it is not lost.
  useEffect(() => {
    if (!hasToggledRef.current) return;
    hasToggledRef.current = false;
    (isAttached ? removeRef : addRef).current?.focus();
  }, [isAttached]);

  const toggle = (nextIsAttached: boolean) => {
    hasToggledRef.current = true;
    setAttached(nextIsAttached);
    if (nextIsAttached) track('configurator_attach', { source: 'contact' });
  };

  if (!isAttached) {
    return (
      <Button
        ref={addRef}
        variant="dashed"
        onClick={() => toggle(true)}
        testId={childTestId(testId, 'add')}
      >
        {t('contact.config.add')}
      </Button>
    );
  }

  return (
    <div
      className={styles.attached}
      data-testid={childTestId(testId, 'attached')}
    >
      <span className={styles.label}>
        <span className={styles.marker} aria-hidden="true" />
        <span id={labelId}>{t('contact.config.attached')}</span>
      </span>
      <Button
        ref={removeRef}
        variant="ghost"
        aria-describedby={labelId}
        onClick={() => toggle(false)}
        testId={childTestId(testId, 'remove')}
      >
        {t('contact.config.remove')}
      </Button>
    </div>
  );
}
