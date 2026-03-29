import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, animate, useMotionValue, PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { GALLERY_LAYERS } from './constants';
import styles from './gallery.module.css';

const CARDS = GALLERY_LAYERS;
const AUTO_INTERVAL = 4000;

const GalleryView = () => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getWidth = () => containerRef.current?.clientWidth ?? window.innerWidth;

  const goTo = useCallback((i: number) => {
    const next = ((i % CARDS.length) + CARDS.length) % CARDS.length;
    setIndex(next);
    setProgressKey((k) => k + 1);
    animate(x, -next * getWidth(), { type: 'spring', stiffness: 280, damping: 30 });
  }, [x]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => goTo(index + 1), AUTO_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [index, paused, goTo]);

  const pause = () => {
    setPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const resume = () => {
    setPaused(false);
    setProgressKey((k) => k + 1);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = getWidth() * 0.2;
    const swipeByOffset = Math.abs(info.offset.x) > threshold;
    const swipeByVelocity = Math.abs(info.velocity.x) > 500;
    if (swipeByOffset || swipeByVelocity) {
      goTo(index + (info.offset.x < 0 ? 1 : -1));
    } else {
      goTo(index);
    }
    resume();
  };

  return (
    <section className={styles.gallery} id="gallery" onMouseEnter={pause} onMouseLeave={resume}>
      <div className={styles.sectionMainBg} />
      <div className={styles.galleryBackground}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </div>

      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className={styles.sectionTag}>{t('gallery.tag')}</span>
        <h2 className={styles.sectionTitle}>
          {t('gallery.title1')}{' '}
          <span className={styles.titleAccent}>{t('gallery.title2')}</span>
        </h2>
      </motion.div>

      <div className={styles.carouselWrap} ref={containerRef}>
        <motion.div
          className={styles.strip}
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -(CARDS.length - 1) * 9999, right: 0 }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragStart={pause}
          onDragEnd={onDragEnd}
          whileDrag={{ cursor: 'grabbing' }}
        >
          {CARDS.map((layer, i) => (
            <div key={layer.id} className={styles.slide}>
              {layer.item.type === 'video' ? (
                <div className={styles.videoSlide}>
                  <div className={styles.playBtn}>
                    <div className={styles.triangle} />
                  </div>
                </div>
              ) : (
                <div className={styles.photoSlide} />
              )}
              <div className={styles.caption}>
                <span className={styles.counter}>{i + 1} / {CARDS.length}</span>
                <p className={styles.captionText}>{layer.item.placeholderLabel}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <button className={styles.arrowLeft} onClick={() => { goTo(index - 1); }} aria-label="Previous">
          ‹
        </button>
        <button className={styles.arrowRight} onClick={() => { goTo(index + 1); }} aria-label="Next">
          ›
        </button>
      </div>

      <div className={styles.dots}>
        {CARDS.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          >
            {i === index && (
              <span
                key={progressKey}
                className={`${styles.dotProgress} ${paused ? styles.dotProgressPaused : ''}`}
                style={{ animationDuration: `${AUTO_INTERVAL}ms` }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default GalleryView;
