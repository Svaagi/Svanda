import * as RadixToast from '@radix-ui/react-toast';
import { TOAST_DURATION_MS } from 'constants/motion';
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/button';
import { childTestId } from 'utils';

import styles from './toast.module.css';
import { type ToastApi, ToastContext } from './toastContext';
import { dismissToast, enqueueToast, type QueuedToast } from './toastQueue';

export interface ToastProviderProps {
  children: ReactNode;
  testId?: string;
}

// Toasts show one at a time in order; each closes after TOAST_DURATION_MS (Radix pauses the
// timer while the toast is hovered or focused) or from its close button.
export function ToastProvider({
  children,
  testId = 'toast',
}: ToastProviderProps) {
  const { t } = useTranslation();
  const [queue, setQueue] = useState<QueuedToast[]>([]);
  const nextIdRef = useRef(0);

  const showToast = useCallback((message: string) => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    setQueue((existing) => enqueueToast(existing, { id, message }));
  }, []);

  const toastApi = useMemo<ToastApi>(() => ({ showToast }), [showToast]);
  const [current] = queue;

  const handleOpenChange = (id: number, isOpen: boolean) => {
    if (!isOpen) setQueue((existing) => dismissToast(existing, id));
  };

  return (
    <ToastContext value={toastApi}>
      <RadixToast.Provider
        duration={TOAST_DURATION_MS}
        label={t('ui.toast.label')}
      >
        {children}
        {current && (
          <RadixToast.Root
            key={current.id}
            type="background"
            className={styles.toast}
            onOpenChange={(isOpen) => handleOpenChange(current.id, isOpen)}
            data-testid={testId}
          >
            <RadixToast.Description
              className={styles.message}
              data-testid={childTestId(testId, 'message')}
            >
              {current.message}
            </RadixToast.Description>
            <RadixToast.Close asChild>
              <Button variant="ghost" testId={childTestId(testId, 'close')}>
                {t('ui.close')}
              </Button>
            </RadixToast.Close>
          </RadixToast.Root>
        )}
        <RadixToast.Viewport
          className={styles.viewport}
          label={t('ui.toast.region')}
          data-testid={childTestId(testId, 'viewport')}
        />
      </RadixToast.Provider>
    </ToastContext>
  );
}
