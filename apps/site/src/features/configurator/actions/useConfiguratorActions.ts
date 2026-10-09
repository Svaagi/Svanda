import { CONTACT_PAGE } from 'constants/stage';
import { useGoToPage } from 'features/stage';
import { useTranslation } from 'react-i18next';
import { useToast } from 'ui';

import { useConfiguratorStore } from '../model';
import { useEditingNames } from '../useEditingNames';
import { copyToClipboard } from './clipboard';
import { useImportPanel } from './useImportPanel';

type ConfiguratorActionsOptions = {
  // Called after the configuration is attached, just before the page scrolls to contact.
  onAttach?: () => void;
};

const { getState } = useConfiguratorStore;

// The configurator's buttons: attach to the contact request, reset, copy (falling back to
// a manual copy from the import field) and import. Each outcome is announced in a toast,
// except detaching, which is silent: the attach button's label already says it.
export function useConfiguratorActions({
  onAttach,
}: ConfiguratorActionsOptions = {}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const goToPage = useGoToPage();
  const { designName, target, cssLabels } = useEditingNames();
  const importPanel = useImportPanel();

  const copy = async (text: string, copiedMessage: string) => {
    if (await copyToClipboard(text)) {
      showToast(copiedMessage);
      return;
    }
    importPanel.showForManualCopy(text);
    showToast(t('configurator.toasts.copyFallback'));
  };

  const handleAttachClick = () => {
    const willAttach = !getState().isAttached;
    getState().setAttached(willAttach);
    if (!willAttach) return;
    showToast(t('configurator.toasts.attached'));
    onAttach?.();
    goToPage(CONTACT_PAGE);
  };

  const handleResetClick = () => {
    getState().resetCurrent();
    showToast(t('configurator.toasts.reset', { target }));
  };

  // The copy outcome is announced by its toast; nothing awaits it.
  const handleCopyJsonClick = () =>
    void copy(getState().exportJson(), t('configurator.toasts.copiedJson'));

  const handleCopyCssClick = () =>
    void copy(
      getState().exportCss(cssLabels),
      t('configurator.toasts.copiedCss', { design: designName }),
    );

  return {
    importPanel,
    handleAttachClick,
    handleResetClick,
    handleCopyJsonClick,
    handleCopyCssClick,
  };
}
