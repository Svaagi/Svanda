import type { ProductId } from 'constants/products';
import { type ModelSlot, useStageStore } from 'features/stage';
import { type RefObject, useEffect } from 'react';

import { measureModelSlot } from './productLayout';

type ModelSlotRefs = {
  stage: RefObject<HTMLElement | null>;
  heading: RefObject<HTMLElement | null>;
  body: RefObject<HTMLElement | null>;
};

const isSameSlot = (
  currentSlot: ModelSlot | null,
  nextSlot: ModelSlot | null,
) =>
  currentSlot === nextSlot ||
  (currentSlot !== null &&
    nextSlot !== null &&
    currentSlot.top === nextSlot.top &&
    currentSlot.bottom === nextSlot.bottom);

const publishModelSlot = (productId: ProductId, slot: ModelSlot | null) => {
  const { modelAnchors, setModelAnchors } = useStageStore.getState();
  if (!isSameSlot(modelAnchors[productId], slot))
    setModelAnchors({ [productId]: slot });
};

// Publishes the band between the heading and the body (stage px), so the portrait 3D model
// centres between them. Landscape copy sits beside the model, so nothing is published there.
export function usePublishModelSlot(
  productId: ProductId,
  isPortrait: boolean,
  { stage, heading, body }: ModelSlotRefs,
) {
  useEffect(() => {
    const stageElement = stage.current;
    const headingElement = heading.current;
    const bodyElement = body.current;
    if (!isPortrait || !stageElement || !headingElement || !bodyElement)
      return undefined;

    const measure = () =>
      publishModelSlot(
        productId,
        measureModelSlot(
          headingElement.getBoundingClientRect(),
          bodyElement.getBoundingClientRect(),
          stageElement.getBoundingClientRect().top,
        ),
      );
    measure();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measure);
    observer?.observe(headingElement);
    observer?.observe(bodyElement);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      publishModelSlot(productId, null);
    };
  }, [productId, isPortrait, stage, heading, body]);
}
