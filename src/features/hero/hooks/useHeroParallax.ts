import { useScroll, useTransform } from 'framer-motion';

import { useIsMobile } from 'hooks/useIsMobile';

import {
  HERO_PARALLAX_BLOBS_OFFSET,
  HERO_PARALLAX_OPACITY_SCROLL_RANGE,
  HERO_PARALLAX_PRODUCT_OFFSET,
  HERO_PARALLAX_SCROLL_RANGE,
  HERO_PARALLAX_TEXT_OFFSET,
} from '../constants';

/*
 * On mobile we collapse the parallax offsets to 0 — keeping the opacity fade
 * but dropping the Y translations. Fewer transform-driven style updates per
 * scroll tick keeps the hero→next-section transition from stuttering.
 */
export const useHeroParallax = () => {
  const { scrollY } = useScroll();
  const isMobile = useIsMobile();

  const blobsOffset = isMobile ? 0 : HERO_PARALLAX_BLOBS_OFFSET;
  const textOffset = isMobile ? 0 : HERO_PARALLAX_TEXT_OFFSET;
  const productOffset = isMobile ? 0 : HERO_PARALLAX_PRODUCT_OFFSET;

  const blobsY = useTransform(scrollY, [0, HERO_PARALLAX_SCROLL_RANGE], [0, blobsOffset]);
  const textY = useTransform(scrollY, [0, HERO_PARALLAX_SCROLL_RANGE], [0, textOffset]);
  const opacityOut = useTransform(scrollY, [0, HERO_PARALLAX_OPACITY_SCROLL_RANGE], [1, 0]);
  const productY = useTransform(scrollY, [0, HERO_PARALLAX_SCROLL_RANGE], [0, productOffset]);

  return { blobsY, textY, opacityOut, productY };
};
