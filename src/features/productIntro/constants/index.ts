import { FeatureCard } from '../types';

export const FEATURE_CARDS: Omit<FeatureCard, 'title' | 'description'>[] = [
  {
    id: 'karaoke-jukebox',
    icon: 'music',
    accentColor: 'rgba(255, 107, 53, 0.15)',
    translationKey: 'karaokeJukebox',
  },
  {
    id: 'self-service',
    icon: 'hand-pointer',
    accentColor: 'rgba(255, 61, 127, 0.12)',
    translationKey: 'selfService',
  },
  {
    id: 'catalogue',
    icon: 'compact-disc',
    accentColor: 'rgba(79, 172, 254, 0.15)',
    translationKey: 'catalogue',
  },
  {
    id: 'revenue',
    icon: 'coins',
    accentColor: 'rgba(167, 139, 250, 0.15)',
    translationKey: 'revenue',
  },
];
