import * as RadixDialog from '@radix-ui/react-dialog';
import { useReducedMotion } from 'hooks';
import { AnimatePresence, LazyMotion, m } from 'motion/react';
import type { KeyboardEventHandler, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/button';
import { childTestId } from 'utils';

import styles from './dialog.module.css';
import { getContentMotion, getOverlayMotion } from './dialogMotion';
import { useReturnFocus } from './useReturnFocus';

const loadMotionFeatures = () =>
  import('./dialogMotionFeatures').then(({ domAnimation }) => domAnimation);

// `sheet` fills the viewport below the site header instead of floating centred;
// `bottomSheet` slides up over the lower part of the page, which stays visible above it;
// `fullscreen` covers the whole viewport in a dark scrim whatever the theme (media viewers).
type DialogVariant = 'centered' | 'sheet' | 'bottomSheet' | 'fullscreen';

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
  fullscreen: {
    overlay: `${styles.overlay} ${styles.fullscreenOverlay}`,
    content: `${styles.content} ${styles.fullscreen}`,
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
  // Keys pressed anywhere inside the dialog (Escape stays with Radix).
  onContentKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  testId?: string;
}

// Radix owns the focus trap, Escape, outside click and focus restore; motion only animates
// the presence, which is why the parts are force-mounted inside AnimatePresence. LazyMotion
// with the slim `m` components keeps the animation features in their own chunk.
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  closeLabel,
  variant = 'centered',
  onContentKeyDown,
  testId = 'dialog',
}: DialogProps) {
  const { t } = useTranslation();
  const isReducedMotion = useReducedMotion();
  const { handleOpenAutoFocus, handleCloseAutoFocus } = useReturnFocus();

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <LazyMotion features={loadMotionFeatures} strict>
        <AnimatePresence>
          {open && (
            <RadixDialog.Portal forceMount>
              <RadixDialog.Overlay asChild forceMount>
                <m.div
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
                onKeyDown={onContentKeyDown}
                // Radix points aria-describedby at its Description part; without one it would
                // reference a missing element and warn, so the attribute is dropped.
                {...(!description && { 'aria-describedby': undefined })}
              >
                <m.div
                  className={VARIANT_CLASS_NAMES[variant].content}
                  data-testid={testId}
                  {...getContentMotion(
                    isReducedMotion,
                    variant === 'bottomSheet',
                  )}
                >
                  <div className={styles.header}>
                    <RadixDialog.Title
                      className={styles.title}
                      data-testid={childTestId(testId, 'title')}
                    >
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
                </m.div>
              </RadixDialog.Content>
            </RadixDialog.Portal>
          )}
        </AnimatePresence>
      </LazyMotion>
    </RadixDialog.Root>
  );
}
