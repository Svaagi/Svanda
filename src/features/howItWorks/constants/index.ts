import { StepItem } from '../types';

export const STEPS: StepItem[] = [
  {
    id: 'step-browse',
    stepNumber: '01',
    icon: 'search',
    title: 'Browse the Catalogue',
    description:
      'Guests walk up to the machine and search from 25,000+ songs directly on the touchscreen.',
  },
  {
    id: 'step-pay',
    stepNumber: '02',
    icon: 'credit-card',
    title: 'Pay on the Machine',
    description:
      'One tap to pay. The integrated payment terminal accepts cards and contactless payments.',
  },
  {
    id: 'step-play',
    stepNumber: '03',
    icon: 'microphone',
    title: 'Sing or Play',
    description:
      'The song plays through the system — as karaoke with lyrics, or as music for the whole bar.',
  },
];
