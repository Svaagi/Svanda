import { FeatureCard } from '../types';

export const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'karaoke-jukebox',
    icon: 'music',
    title: 'Karaoke & Jukebox in One',
    description:
      'No separate setups. One sleek machine handles both karaoke nights and ambient music — on demand.',
    accentColor: 'rgba(255, 107, 53, 0.15)',
  },
  {
    id: 'self-service',
    icon: 'hand-pointer',
    title: 'Guests Pay Per Song',
    description:
      'Customers browse, choose and pay directly on the machine. Typically 10 CZK per song. No staff needed.',
    accentColor: 'rgba(255, 61, 127, 0.12)',
  },
  {
    id: 'catalogue',
    icon: 'compact-disc',
    title: '25,000+ Songs',
    description:
      'From pop to rock, hip-hop to classics. An ever-growing catalogue that covers every crowd and every mood.',
    accentColor: 'rgba(79, 172, 254, 0.15)',
  },
  {
    id: 'revenue',
    icon: 'coins',
    title: 'Passive Venue Revenue',
    description:
      'Every song played generates income. The machine works for your venue 24/7, even during quiet hours.',
    accentColor: 'rgba(167, 139, 250, 0.15)',
  },
];
