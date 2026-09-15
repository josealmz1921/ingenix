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
  console.log('description',description);
  
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
        <h3 className={styles.subtitle}>
          {subtitle}
        </h3>
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