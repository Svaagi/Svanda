import { useContext } from 'react';

import { type ToastApi, ToastContext } from './toastContext';

export function useToast(): ToastApi {
  const toastApi = useContext(ToastContext);
  if (!toastApi) {
    throw new Error('useToast must be used inside a ToastProvider');
  }

  return toastApi;
}
