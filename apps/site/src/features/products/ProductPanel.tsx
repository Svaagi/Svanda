import { type ProductId, PRODUCTS } from 'constants/products';
import { useStageStore } from 'features/stage';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PixelText } from 'ui';
import { childTestId } from 'utils';

import { productHeadingCellPx } from './productLayout';
import styles from './productPanel.module.css';
import { usePublishModelSlot } from './usePublishModelSlot';

export type ProductPanelProps = {
  productId: ProductId;
  testId?: string;
};

export function ProductPanel({
  productId,
  testId = `product-panel-${productId}`,
}: ProductPanelProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const { side, headingColors } = PRODUCTS[productId];
  const width = useStageStore((state) => state.viewport.width);
  const isPortrait = useStageStore((state) => state.viewport.isPortrait);
  const headingCellPx = productHeadingCellPx({ width, isPortrait });

  const panelRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  usePublishModelSlot(productId, isPortrait, {
    stage: panelRef,
    heading: headingRef,
    body: bodyRef,
  });

  return (
    <section
      ref={panelRef}
      className={styles.productPanel}
      aria-labelledby={headingId}
      data-side={side}
      data-testid={testId}
    >
      <div className={styles.copy}>
        <h2
          ref={headingRef}
          id={headingId}
          className={styles.heading}
          data-testid={childTestId(testId, 'heading')}
        >
          <PixelText
            text={t(`${productId}.tag`)}
            cellSize={headingCellPx}
            colors={headingColors}
            testId={childTestId(testId, 'heading-pixels')}
          />
        </h2>
        <p className={styles.title} data-testid={childTestId(testId, 'title')}>
          {t(`${productId}.title`)}
        </p>
        <p
          ref={bodyRef}
          className={styles.body}
          data-testid={childTestId(testId, 'body')}
        >
          {t(`${productId}.body`)}
        </p>
      </div>
    </section>
  );
}
