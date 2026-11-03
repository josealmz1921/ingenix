import styles from './Progress.module.css';

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

export default function Progress({ value, max = 100, label, className = '' }: ProgressProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), safeMax) : 0;
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div
      className={`${styles.progress} ${className}`}
      role="progressbar"
      aria-label={label || 'Progreso'}
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={safeMax}
    >
      <span className={styles.bar} style={{ width: `${percentage}%` }} />
    </div>
  );
}
