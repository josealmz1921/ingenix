import type { ProgressContent } from '../../../types/page';
import type { TextRenderer } from '../../../types/render';
import Progress from '../../ui/Progress/Progress';
import styles from './ProgressIndicators.module.css';

interface Props {
  items: ProgressContent[];
  variant: 'default' | 'compact';
  renderText?: TextRenderer;
}

export default function ProgressIndicators({ items, variant, renderText }: Props) {
  return (
    <ul className={`${styles.list} ${variant === 'compact' ? styles.compact : ''}`}>
      {items.map((item, index) => (
        <li key={item.id} className={styles.item}>
          <div className={styles.heading}>
            <strong>
              {renderText ? renderText(`items.${index}.title`, item.title) : item.title}
            </strong>
            <span>
              {item.value} / {item.max}
            </span>
          </div>
          <Progress value={item.value} max={item.max} label={item.title} />
        </li>
      ))}
    </ul>
  );
}
