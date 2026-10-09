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

// `sheet` fills the viewport below the site header instead of floating centred;
// `bottomSheet` slides up over the lower part of the page, which stays visible above it.
type DialogVariant = 'centered' | 'sheet' | 'bottomSheet';

const VARIANT_CLASS_NAMES: Record<
  DialogVariant,
  { overlay: string | undefined; content: string }
> = {
  centered: {
    overlay: styles.overlay,
    content: `${styles.content} ${styles.centered}`,
  },
  sheet: {
    overlay: `${styles.overlay} ${styles.sheetOverlay}`,
    content: `${styles.content} ${styles.sheet}`,
  },
  bottomSheet: {
    overlay: `${styles.overlay} ${styles.bottomSheetOverlay}`,
    content: `${styles.content} ${styles.bottomSheet}`,
  },
};

export interface DialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  closeLabel?: string;
  variant?: DialogVariant;
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
  variant = 'centered',
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
                className={VARIANT_CLASS_NAMES[variant].overlay}
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
                className={VARIANT_CLASS_NAMES[variant].content}
                data-testid={testId}
                {...getContentMotion(
                  isReducedMotion,
                  variant === 'bottomSheet',
                )}
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
