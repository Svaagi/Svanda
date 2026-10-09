import { IMPORT_FIELD_ROWS } from 'constants/configurator';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field, Textarea } from 'ui';
import { childTestId } from 'utils';

import { useConfiguratorStore } from '../model';
import styles from './configuratorActions.module.css';
import { useConfiguratorActions } from './useConfiguratorActions';

export type ConfiguratorActionsProps = {
  // Called after the configuration is attached (the bottom sheet closes).
  onAttach?: () => void;
  testId?: string;
};

export function ConfiguratorActions({
  onAttach,
  testId = 'configurator-actions',
}: ConfiguratorActionsProps) {
  const { t } = useTranslation();
  const importPanelId = useId();
  const isAttached = useConfiguratorStore((state) => state.isAttached);
  const {
    importPanel,
    handleAttachClick,
    handleResetClick,
    handleCopyJsonClick,
    handleCopyCssClick,
  } = useConfiguratorActions({ onAttach });

  return (
    <div className={styles.configuratorActions} data-testid={testId}>
      <div className={styles.wide}>
        <Button
          variant={isAttached ? 'outline' : 'fill'}
          onClick={handleAttachClick}
          testId={childTestId(testId, 'attach')}
        >
          {t(
            isAttached
              ? 'configurator.actions.attached'
              : 'configurator.actions.attach',
          )}
        </Button>
      </div>
      <Button onClick={handleResetClick} testId={childTestId(testId, 'reset')}>
        {t('configurator.actions.reset')}
      </Button>
      <Button
        onClick={handleCopyJsonClick}
        testId={childTestId(testId, 'copy-json')}
      >
        {t('configurator.actions.copyJson')}
      </Button>
      <div className={styles.wide}>
        <Button
          onClick={handleCopyCssClick}
          testId={childTestId(testId, 'copy-css')}
        >
          {t('configurator.actions.copyCss')}
        </Button>
      </div>
      <div className={styles.wide}>
        <Button
          variant="ghost"
          aria-expanded={importPanel.isOpen}
          aria-controls={importPanelId}
          onClick={importPanel.toggle}
          testId={childTestId(testId, 'import-toggle')}
        >
          {t('configurator.actions.importToggle')}
        </Button>
      </div>
      <div
        id={importPanelId}
        className={styles.importPanel}
        hidden={!importPanel.isOpen}
        data-testid={childTestId(testId, 'import')}
      >
        <Field
          label={t('configurator.actions.importLabel')}
          testId={childTestId(testId, 'import-field')}
        >
          <Textarea
            ref={importPanel.fieldRef}
            value={importPanel.text}
            onChange={(event) => importPanel.setText(event.currentTarget.value)}
            rows={IMPORT_FIELD_ROWS}
            spellCheck={false}
            testId={childTestId(testId, 'import-text')}
          />
        </Field>
        <Button
          variant="fill"
          onClick={importPanel.apply}
          testId={childTestId(testId, 'import-apply')}
        >
          {t('configurator.actions.importApply')}
        </Button>
      </div>
    </div>
  );
}
