import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from 'ui';

import { CONFIG_IMPORT_ERROR_KEYS, useConfiguratorStore } from '../model';

// The "paste saved settings" panel: a JSON field applied on demand. It doubles as the
// manual copy fallback, showing text selected for Ctrl+C.
export function useImportPanel() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  const showForManualCopy = (copyText: string) => {
    // The field has to be on screen before it can be focused and selected.
    flushSync(() => {
      setText(copyText);
      setIsOpen(true);
    });
    fieldRef.current?.focus();
    fieldRef.current?.select();
  };

  const apply = () => {
    const result = useConfiguratorStore.getState().importJson(text);
    showToast(
      result.isOk
        ? t('configurator.toasts.imported')
        : t(CONFIG_IMPORT_ERROR_KEYS[result.error]),
    );
  };

  return {
    isOpen,
    text,
    setText,
    fieldRef,
    toggle: () => setIsOpen((wasOpen) => !wasOpen),
    showForManualCopy,
    apply,
  };
}
