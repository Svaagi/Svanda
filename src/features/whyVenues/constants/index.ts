import { BenefitItem } from '../types';

export const BENEFITS: Omit<BenefitItem, 'title' | 'description'>[] = [
  {
    id: 'two-in-one',
    icon: 'layer-group',
    translationKey: 'twoInOne',
  },
  {
    id: 'self-service',
    icon: 'hand-pointer',
    translationKey: 'selfService',
  },
  {
    id: 'affordable',
    icon: 'tag',
    translationKey: 'affordable',
  },
  {
    id: 'revenue',
    icon: 'arrow-trend-up',
    translationKey: 'revenue',
  },
  {
    id: 'catalogue',
    icon: 'music',
    translationKey: 'catalogue',
  },
  {
    id: 'presence',
    icon: 'star',
    translationKey: 'presence',
  },
];
