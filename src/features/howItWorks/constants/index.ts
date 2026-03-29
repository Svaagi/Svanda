import { StepItem } from '../types';

export const STEPS: Omit<StepItem, 'title' | 'description'>[] = [
  {
    id: 'step-browse',
    stepNumber: '01',
    icon: 'search',
    translationKey: 'browse',
  },
  {
    id: 'step-pay',
    stepNumber: '02',
    icon: 'credit-card',
    translationKey: 'pay',
  },
  {
    id: 'step-play',
    stepNumber: '03',
    icon: 'microphone',
    translationKey: 'play',
  },
];
