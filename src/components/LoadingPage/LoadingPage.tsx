'use client';

import { useEffect, useRef, useState } from 'react';
import { CpuChipIcon } from '@heroicons/react/24/outline';
import type { AnimationItem } from 'lottie-web';
import styles from './loading.module.css';

type Props = {
  message?: string;
  fullScreen?: boolean;
};

export default function LoadingPage({ message = 'Cargando contenido…', fullScreen = false }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animation: AnimationItem | undefined;
    let disposed = false;

    function updatePlayback() {
      if (!animation?.isLoaded) return;
      if (motion.matches) {
        animation.goToAndStop(40, true);
      } else if (document.hidden) {
        animation.pause();
      } else {
        animation.play();
      }
    }

    async function loadAnimation() {
      try {
        const [module, response] = await Promise.all([
          import('lottie-web'),
          fetch('/animations/cpu-loading.json', { signal: controller.signal }),
        ]);
        if (!response.ok) throw new Error('Animation unavailable');
        const animationData = await response.json();
        if (disposed || !container.current) return;
        animation = module.default.loadAnimation({
          container: container.current,
          renderer: 'svg',
          animationData,
          loop: true,
          autoplay: false,
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        });
        animation.addEventListener('DOMLoaded', () => {
          if (disposed) return;
          setReady(true);
          updatePlayback();
        });
      } catch {
        // The static CPU and status text remain visible offline or if loading fails.
      }
    }

    motion.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);
    void loadAnimation();
    return () => {
      disposed = true;
      controller.abort();
      motion.removeEventListener('change', updatePlayback);
      document.removeEventListener('visibilitychange', updatePlayback);
      animation?.destroy();
    };
  }, []);

  return (
    <div className={`${styles.loading} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.content}>
        <div className={styles.artwork} aria-hidden="true">
          {!ready && <CpuChipIcon className={styles.fallback} />}
          <div ref={container} className={styles.animation} />
        </div>
        <span className={styles.brand}>INGENIX</span>
        <p className={styles.message} role="status" aria-live="polite" aria-atomic="true">
          {message}
        </p>
      </div>
    </div>
  );
}
