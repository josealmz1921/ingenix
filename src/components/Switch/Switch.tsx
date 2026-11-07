'use client';

import { useId } from 'react';
import styles from './switch.module.css';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  hideLabel?: boolean;
  description?: string;
};

export default function Switch({ label, checked, onChange, disabled = false, hideLabel = false, description }: Props) {
  const id = useId();
  return (
    <label className={styles.root} data-disabled={disabled}>
      <span className={hideLabel ? styles.hiddenLabel : styles.copy}>
        <span id={`${id}-label`}>{label}</span>
        {description && <span id={`${id}-description`} className={styles.description}>{description}</span>}
      </span>
      <input
        className={styles.control}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </label>
  );
}
