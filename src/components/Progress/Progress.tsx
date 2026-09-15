import styles from './Progress.module.css';
import type { ProgressProps } from './Progress.types';

export function Progress({
  value,
  max = 100,
  className = '',
}: ProgressProps) {
  const percentage = Math.min(
    Math.max((value / max) * 100, 0),
    100
  );

  return (
    <div
      className={`${styles.progress} ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <span
        className={styles.bar}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}