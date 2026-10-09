import { track } from 'lib/analytics';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from 'ui';
import { childTestId } from 'utils';

import styles from './configuratorSection.module.css';

export type ConfiguratorSheetProps = {
  // The sheet's content, given a way to close the sheet.
  children: (close: () => void) => ReactNode;
  testId?: string;
};

// Small screens: the controls live in a bottom sheet, so the live screen stays in view
// above it. "Done" sticks to the sheet's top while its content scrolls.
export function ConfiguratorSheet({
  children,
  testId = 'configurator-sheet',
}: ConfiguratorSheetProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const handleOpenClick = () => {
    setIsOpen(true);
    track('configurator_open', { layout: 'sheet' });
  };

  return (
    <>
      <div className={styles.sheetButton}>
        <Button
          variant="fill"
          onClick={handleOpenClick}
          testId={childTestId(testId, 'open')}
        >
          {t('configurator.sheet.open')}
        </Button>
      </div>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={t('configurator.sheet.title')}
        closeLabel={t('configurator.sheet.done')}
        variant="bottomSheet"
        testId={testId}
      >
        {children(close)}
      </Dialog>
    </>
  );
}
