import { createContext } from 'react';

export interface FieldContextValue {
  controlId: string;
  describedBy?: string;
  isInvalid: boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);
