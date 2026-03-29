import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { HotspotPin } from './components';
import styles from './productShowcase.module.css';
import { ProductHotspot } from './types';

const HOTSPOT_KEYS: { id: string; translationKey: string; positionX: string; positionY: string }[] = [
  { id: 'screen', translationKey: 'screen', positionX: '48%', positionY: '28%' },
  { id: 'payment', translationKey: 'payment', positionX: '72%', positionY: '60%' },
  { id: 'speaker', translationKey: 'speaker', positionX: '25%', positionY: '72%' },
];

const ProductShowcaseView = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const modelY = useTransform(scrollYProgress, [0, 1], ['-160px', '160px']);
  const titleY = useTransform(scrollYProgress, [0, 0.5], ['60px', '0px']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  const hotspots: ProductHotspot[] = HOTSPOT_KEYS.map((h) => ({
    id: h.id,
    label: t(`showcase.hotspots.${h.translationKey}.label`),
    description: t(`showcase.hotspots.${h.translationKey}.description`),
    positionX: h.positionX,
    positionY: h.positionY,
  }));

  return (
    <motion.section className={styles.productShowcase} id="showcase" ref={sectionRef} style={{}}>
      <div className={styles.sectionMainBg} />

      <div className={styles.background}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </div>

      <div className={styles.backgroundAccent}>
        <div className={styles.blobC} />
      </div>

      <div className={styles.sectionInner}>
        <motion.div
          className={styles.sectionHeader}
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <span className={styles.sectionTag}>{t('showcase.tag')}</span>
          <h2 className={styles.sectionTitle}>
            {t('showcase.title1')}{' '}
            <span className={styles.titleAccent}>{t('showcase.title2')}</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            {t('showcase.subtitle')}
          </p>
        </motion.div>

        <motion.div className={styles.showcaseStage} style={{ y: modelY }}>
          <div className={styles.modelContainer}>
            <div className={styles.modelPlaceholder}>
              <div className={styles.modelPlaceholderGlow} />
              <div className={styles.modelPlaceholderBox}>
                <div className={styles.modelScreen} />
                <div className={styles.modelBody} />
                <div className={styles.modelBase} />
              </div>
              <p className={styles.modelPlaceholderLabel}>
                REPLACE: 3D model file (.glb/.gltf)
                <br />
                Path: /assets/models/svanda-box.glb
                <br />
                Recommended: use @react-three/fiber + drei for GLB rendering
              </p>

              {hotspots.map((hotspot) => (
                <HotspotPin key={hotspot.id} hotspot={hotspot} />
              ))}
            </div>

            <div className={styles.shadowEllipse} />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ProductShowcaseView;
