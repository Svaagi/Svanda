import { useScroll, useTransform } from 'framer-motion';

export const useHeroParallax = () => {
  const { scrollY } = useScroll();

  // Three distinct depth planes driving different parallax speeds.
  // blobs (deepest, fastest) → text (mid) → product (nearest, slowest)
  const blobsY = useTransform(scrollY, [0, 800], [0, -240]);
  const textY = useTransform(scrollY, [0, 800], [0, -120]);
  const scaleOut = useTransform(scrollY, [0, 600], [1, 1.06]);
  const opacityOut = useTransform(scrollY, [0, 480], [1, 0]);
  const productY = useTransform(scrollY, [0, 800], [0, -60]);

  return { blobsY, textY, scaleOut, opacityOut, productY };
};
