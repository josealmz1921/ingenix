import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import styles from './dropzone.module.css';

export default function SortableItem({ id, disabled, label, children }: { id: string; disabled: boolean; label: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      className={styles.item}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {!disabled && (
        <button
          ref={setActivatorNodeRef}
          type="button"
          className={styles.handle}
          {...attributes}
          {...listeners}
          aria-label={label}
        >
          <ArrowsPointingOutIcon />
        </button>
      )}
      {children}
    </div>
  );
}
