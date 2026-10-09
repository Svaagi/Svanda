import { createContext } from 'react';

export interface ToastApi {
  showToast: (message: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
