import * as RadixDialog from '@radix-ui/react-dialog';
import { useReducedMotion } from 'hooks';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/button';
import { childTestId } from 'utils';

import styles from './dialog.module.css';
import { getContentMotion, getOverlayMotion } from './dialogMotion';
import { useReturnFocus } from './useReturnFocus';

export interface DialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  closeLabel?: string;
  testId?: string;
}

// Radix owns the focus trap, Escape, outside click and focus restore; motion only animates
// the presence, which is why the parts are force-mounted inside AnimatePresence.
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  closeLabel,
  testId = 'dialog',
}: DialogProps) {
  const { t } = useTranslation();
  const isReducedMotion = useReducedMotion();
  const { handleOpenAutoFocus, handleCloseAutoFocus } = useReturnFocus();

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount>
            <RadixDialog.Overlay asChild forceMount>
              <motion.div
                className={styles.overlay}
                data-testid={childTestId(testId, 'overlay')}
                {...getOverlayMotion(isReducedMotion)}
              />
            </RadixDialog.Overlay>
            <RadixDialog.Content
              asChild
              forceMount
              onOpenAutoFocus={handleOpenAutoFocus}
              onCloseAutoFocus={handleCloseAutoFocus}
              // Radix points aria-describedby at its Description part; without one it would
              // reference a missing element and warn, so the attribute is dropped.
              {...(!description && { 'aria-describedby': undefined })}
            >
              <motion.div
                className={styles.content}
                data-testid={testId}
                {...getContentMotion(isReducedMotion)}
              >
                <div className={styles.header}>
                  <RadixDialog.Title className={styles.title}>
                    {title}
                  </RadixDialog.Title>
                  <RadixDialog.Close asChild>
                    <Button
                      variant="ghost"
                      testId={childTestId(testId, 'close')}
                    >
                      {closeLabel ?? t('ui.close')}
                    </Button>
                  </RadixDialog.Close>
                </div>
                {description && (
                  <RadixDialog.Description className={styles.description}>
                    {description}
                  </RadixDialog.Description>
                )}
                {children}
              </motion.div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}
