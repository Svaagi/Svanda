import { BlobConfig } from '../types';

export const HERO_PARALLAX_SCROLL_RANGE = 800;
export const HERO_PARALLAX_BLOBS_OFFSET = -240;
export const HERO_PARALLAX_TEXT_OFFSET = -120;
export const HERO_PARALLAX_PRODUCT_OFFSET = -60;
export const HERO_PARALLAX_OPACITY_SCROLL_RANGE = 480;

export const HERO_BLOBS: BlobConfig[] = [
  {
    id: 'blob-orange',
    size: 720,
    top: '-20%',
    left: '-12%',
    color: [
      'radial-gradient(circle at 30% 26%, rgba(255,245,210,0.85) 0%, transparent 26%)',
      'radial-gradient(circle at 48% 44%, rgba(255,100,40,0.98) 0%, rgba(255,70,130,0.80) 32%, rgba(200,100,220,0.38) 60%, transparent 78%)',
    ].join(', '),
    blur: 6,
    delay: 0,
    duration: 8,
    borderRadius: '65% 35% 48% 52% / 58% 44% 56% 42%',
  },
  {
    id: 'blob-pink',
    size: 580,
    top: '14%',
    left: '24%',
    color: [
      'radial-gradient(circle at 35% 30%, rgba(255,240,230,0.70) 0%, transparent 24%)',
      'radial-gradient(circle at 50% 46%, rgba(255,61,127,0.90) 0%, rgba(220,80,180,0.65) 35%, rgba(160,100,240,0.28) 62%, transparent 78%)',
    ].join(', '),
    blur: 8,
    delay: 1.5,
    duration: 10,
    borderRadius: '44% 56% 62% 38% / 50% 62% 38% 50%',
  },
  {
    id: 'blob-blue',
    size: 640,
    top: '6%',
    left: '56%',
    color: [
      'radial-gradient(circle at 33% 28%, rgba(220,245,255,0.80) 0%, transparent 26%)',
      'radial-gradient(circle at 46% 48%, rgba(60,160,255,0.92) 0%, rgba(80,220,240,0.68) 36%, rgba(120,150,255,0.30) 62%, transparent 78%)',
    ].join(', '),
    blur: 6,
    delay: 0.8,
    duration: 9,
    borderRadius: '55% 45% 38% 62% / 42% 58% 46% 54%',
  },
  {
    id: 'blob-purple',
    size: 500,
    top: '36%',
    left: '70%',
    color: [
      'radial-gradient(circle at 34% 30%, rgba(240,230,255,0.72) 0%, transparent 24%)',
      'radial-gradient(circle at 50% 50%, rgba(167,139,250,0.88) 0%, rgba(120,60,240,0.55) 42%, transparent 68%)',
    ].join(', '),
    blur: 8,
    delay: 2,
    duration: 11,
    borderRadius: '38% 62% 54% 46% / 60% 40% 60% 40%',
  },
  {
    id: 'blob-warm',
    size: 540,
    top: '50%',
    left: '-14%',
    color: [
      'radial-gradient(circle at 36% 28%, rgba(255,250,220,0.78) 0%, transparent 26%)',
      'radial-gradient(circle at 50% 52%, rgba(255,190,60,0.88) 0%, rgba(255,140,80,0.58) 38%, rgba(255,100,120,0.22) 64%, transparent 78%)',
    ].join(', '),
    blur: 7,
    delay: 0.5,
    duration: 12,
    borderRadius: '60% 40% 50% 50% / 46% 54% 52% 48%',
  },
];
