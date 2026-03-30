import { useScroll, useTransform } from 'framer-motion';

import {
  HERO_PARALLAX_BLOBS_OFFSET,
  HERO_PARALLAX_OPACITY_SCROLL_RANGE,
  HERO_PARALLAX_PRODUCT_OFFSET,
  HERO_PARALLAX_SCROLL_RANGE,
  HERO_PARALLAX_TEXT_OFFSET,
} from '../constants';

export const useHeroParallax = () => {
  const { scrollY } = useScroll();

  const blobsY = useTransform(scrollY, [0, HERO_PARALLAX_SCROLL_RANGE], [0, HERO_PARALLAX_BLOBS_OFFSET]);
  const textY = useTransform(scrollY, [0, HERO_PARALLAX_SCROLL_RANGE], [0, HERO_PARALLAX_TEXT_OFFSET]);
  const opacityOut = useTransform(scrollY, [0, HERO_PARALLAX_OPACITY_SCROLL_RANGE], [1, 0]);
  const productY = useTransform(scrollY, [0, HERO_PARALLAX_SCROLL_RANGE], [0, HERO_PARALLAX_PRODUCT_OFFSET]);

  return { blobsY, textY, opacityOut, productY };
};
