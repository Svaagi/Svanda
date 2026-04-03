import { BlobConfig } from 'components/GlassBlob';

export const HERO_PARALLAX_SCROLL_RANGE = 800;
export const HERO_PARALLAX_BLOBS_OFFSET = -240;
export const HERO_PARALLAX_TEXT_OFFSET = -120;
export const HERO_PARALLAX_PRODUCT_OFFSET = -60;
export const HERO_PARALLAX_OPACITY_SCROLL_RANGE = 480;

export const HERO_BLOBS: BlobConfig[] = [
  // Left side
  {
    id: 'blob-top-left',
    size: 700,
    height: 580,
    top: '-10%',
    left: '5%',
    color: [
      'radial-gradient(circle at 24% 26%, rgba(255,148,30,1.0) 0%, transparent 40%)',
      'radial-gradient(circle at 62% 48%, rgba(232,62,76,1.0) 0%, transparent 34%)',
      'radial-gradient(circle at 82% 24%, rgba(148,148,192,0.90) 0%, transparent 36%)',
      'radial-gradient(circle at 40% 82%, rgba(212,102,158,0.85) 0%, transparent 34%)',
    ].join(', '),
    delay: 0,
    duration: 12,
    borderRadius: '78% 22% 62% 38% / 24% 72% 28% 76%',
    borderRadiusAlt: '30% 70% 22% 78% / 74% 26% 76% 24%',
  },
  {
    id: 'blob-bottom-left',
    size: 680,
    height: 480,
    top: '50%',
    left: '3%',
    color: [
      'radial-gradient(circle at 28% 32%, rgba(178,208,196,1.0) 0%, transparent 40%)',
      'radial-gradient(circle at 66% 54%, rgba(222,98,92,1.0) 0%, transparent 38%)',
      'radial-gradient(circle at 18% 76%, rgba(195,185,215,0.90) 0%, transparent 36%)',
    ].join(', '),
    delay: 0.5,
    duration: 14,
    borderRadius: '24% 76% 70% 30% / 72% 22% 78% 28%',
    borderRadiusAlt: '72% 28% 24% 76% / 26% 78% 22% 74%',
  },
  // Right side — mirrored palette, offset phase
  {
    id: 'blob-top-right',
    size: 660,
    height: 540,
    top: '-8%',
    left: 'calc(100% - 680px)',
    color: [
      'radial-gradient(circle at 76% 28%, rgba(232,62,76,1.0) 0%, transparent 40%)',
      'radial-gradient(circle at 38% 52%, rgba(255,148,30,0.95) 0%, transparent 34%)',
      'radial-gradient(circle at 18% 22%, rgba(148,148,192,0.88) 0%, transparent 36%)',
      'radial-gradient(circle at 60% 80%, rgba(212,102,158,0.80) 0%, transparent 34%)',
    ].join(', '),
    delay: 1.2,
    duration: 13,
    borderRadius: '36% 64% 48% 52% / 62% 38% 66% 34%',
    borderRadiusAlt: '62% 38% 28% 72% / 44% 58% 42% 56%',
  },
];
