'use client';

import { Children, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import styles from './Carousel.module.css';

interface Props {
  children: ReactNode;
  label: string;
  columns: 1 | 2 | 3 | 4;
}

/** Native scrolling keeps cards usable without JavaScript, autoplay or slider dependencies. */
export default function Carousel({ children, label, columns }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const trackId = useId();
  const count = Children.count(children);

  function scroll(direction: -1 | 1) {
    const element = track.current;
    if (!element) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollBy({
      left: direction * element.clientWidth,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      scroll(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }

  return (
    <div className={styles.root} data-columns={columns}>
      <ul
        ref={track}
        id={trackId}
        className={styles.track}
        aria-label={label}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {Children.map(children, (child) => (
          <li className={styles.slide}>{child}</li>
        ))}
      </ul>
      {count > 1 && (
        <div className={styles.controls}>
          <p>Desliza o usa las flechas para explorar.</p>
          <button
            type="button"
            aria-label={`Anterior: ${label}`}
            aria-controls={trackId}
            onClick={() => scroll(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label={`Siguiente: ${label}`}
            aria-controls={trackId}
            onClick={() => scroll(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
