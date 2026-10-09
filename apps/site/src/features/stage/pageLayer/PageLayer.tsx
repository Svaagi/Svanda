import { LAYER_FADE_RATE, STAGE_PAGE_IDS } from 'constants/stage';
import type { CSSProperties, ReactNode } from 'react';

import { useStageStore } from '../stageStore';
import { layerOpacity } from './layerOpacity';
import styles from './pageLayer.module.css';

export type PageLayerProps = {
  pageIndex: number;
  // How fast the layer fades as `vp` leaves its page; it is gone at 1 / fadeRate pages.
  fadeRate?: number;
  // Horizontal drift per page of `vp` distance; the sign sets the direction.
  parallaxPx?: number;
  children?: ReactNode;
  testId?: string;
};

// Opacity and parallax are computed in CSS from `--sv-vp`, so a tween re-renders nothing here.
// React only flips the active page (pointer events, focus) and whether the layer shows at all.
export function PageLayer({
  pageIndex,
  fadeRate = LAYER_FADE_RATE,
  parallaxPx = 0,
  children,
  testId = `page-layer-${STAGE_PAGE_IDS[pageIndex]}`,
}: PageLayerProps) {
  const isActive = useStageStore((state) => state.page === pageIndex);
  const isVisible = useStageStore(
    (state) => layerOpacity(state.vp, pageIndex, fadeRate) > 0,
  );
  const layerStyle = {
    '--layer-index': pageIndex,
    '--layer-fade-rate': fadeRate,
    '--layer-parallax': `${parallaxPx}px`,
  } as CSSProperties;

  return (
    <div
      className={styles.pageLayer}
      style={layerStyle}
      data-active={isActive}
      data-visible={isVisible}
      inert={!isActive}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
