import styles from './SectionHeader.module.css';
import type { SectionHeaderProps } from './SectionHeader.types';

function SectionHeader({
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  return (
    <header
      className={`${styles.header} ${styles[align]} ${className}`}
    >
      <h2 className={styles.title}>
        {title}
      </h2>

      {description && (
        <p className={styles.description}>
          {description}
        </p>
      )}
    </header>
  );
}

export default SectionHeader;