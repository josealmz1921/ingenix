import React from "react";
import styles from "./TextBlock.module.css";

export type TextAlign = "left" | "center" | "right";

export interface TextBlockProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;

  align?: TextAlign;

  className?: string;
}

const TextBlock = ({
  eyebrow,
  title,
  subtitle,
  description,
  align = "left",
  className = "",
}: TextBlockProps) => {
  return (
    <div
      className={`${styles.textBlock} ${styles[align]} ${className}`}
    >
      {eyebrow && (
        <span className={styles.eyebrow}>
          {eyebrow}
        </span>
      )}

      {title && (
        <h2 className={styles.title}>
          {title}
        </h2>
      )}

      {subtitle && (
            <p className={styles.subtitle}>
          {subtitle}
            </p>
      )}

      {description && (
        <p className={styles.description}>
          {description}
        </p>
      )}
    </div>
  );
};

export default TextBlock;
