import styles from './GridCard.module.css';
import type { CardProps } from './GridCard.types';

function GridCard({
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <article
      className={`${styles.card} ${className}`}
      {...props}
    >
      {children}
    </article>
  );
}

export default GridCard;