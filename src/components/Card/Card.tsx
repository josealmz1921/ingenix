import React from "react";
import styles from "./Card.module.css";

export type CardVariant =
  | "default"
  | "image-top"
  | "image-left"
  | "image-right"
  | "featured"
  | "compact";

export interface CardLink {
  text: string;
  href: string;
  target?: "_self" | "_blank";
}

export interface CardProps {
  variant?: CardVariant;
  imageStyle?: "cover" | "contain";

  title: string;
  description?: string;

  image?: string;
  imageAlt?: string;

  icon?: React.ReactNode;

  link?: CardLink;

  className?: string;
  children?: React.ReactNode;
}

const Card = ({
  variant = "default",
  title,
  description,
  image,
  imageAlt = "",
  icon,
  link,
  className = "",
  children,
  imageStyle
}: CardProps) => {

  const imageStyleClass = imageStyle === "contain" ? styles.imageContain : styles.imageCover;

  return (
    <article
      className={`${styles.card} ${styles[variant]} ${className}`}
    >
      {image && (
        <div className={styles.imageWrapper}>
          <img
            src={image}
            alt={imageAlt}
            className={imageStyleClass}
          />
        </div>
      )}

      <div className={styles.content}>
        {icon && (
          <div className={styles.icon}>
            {icon}
          </div>
        )}

        <div className={styles.Recommend}>
          <h3 className={styles.title}>{title}</h3>

          {description && (
            <p className={styles.description}>
              {description}
            </p>
          )}

          {children}
        </div>

        {link && (
          <a
            href={link.href}
            target={link.target}
            rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
            className={styles.link}
          >
            {link.text}
            <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </article>
  );
};

export default Card;