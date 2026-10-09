import { useStageStore } from 'features/stage';
import { type RefObject, useEffect } from 'react';

const publishHeroTextTop = (heroTextTop: number | null) => {
  const { modelAnchors, setModelAnchors } = useStageStore.getState();
  if (modelAnchors.heroTextTop !== heroTextTop)
    setModelAnchors({ heroTextTop });
};

// Publishes where the hero text starts (stage px from the top of its page layer), so the
// 3D model can centre in the space above it on portrait screens.
export function usePublishHeroTextTop(textRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = textRef.current;
    if (!element) return undefined;

    const measure = () => publishHeroTextTop(element.offsetTop);
    measure();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      publishHeroTextTop(null);
    };
  }, [textRef]);
}
