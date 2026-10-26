import React from "react";
import Image from 'next/image';
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
  eyebrow?: string;
  company?: string;
  logo?: string;
  logoAlt?: string;

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
  eyebrow,
  company,
  logo,
  logoAlt = '',
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
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={imageStyleClass}
          />
        </div>
      )}

      <div className={styles.content}>
        {(company || logo) && <div className={styles.company}>
          {logo && <Image src={logo} alt={logoAlt} width={96} height={40} className={styles.logo} />}
          {company && <span>{company}</span>}
        </div>}
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        {icon && (
          <div className={styles.icon}>
            {icon}
          </div>
        )}

        <div className={styles.text}>
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
