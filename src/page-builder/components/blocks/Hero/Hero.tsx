import type { FC } from 'react';
import Image from 'next/image';

import Button from '../../ui/Button/Button';

import styles from './Hero.module.css';

import { HeroProps } from './HeroProps.types';

const Hero: FC<HeroProps> = ({
  eyebrow,
  title,
  description,
  subtitle,

  image,
  imageAlt = '',

  alignment = 'left',
  verticalAlignment = 'center',

  parallax = true,

  imageOpacity = 0.35,

  overlay = true,
  overlayOpacity = 0.35,

  actions = [],
}) => {
  const heroClassName = [
    styles.Hero,
    styles[`Hero--${alignment}`],
    styles[`Hero--vertical-${verticalAlignment}`],
    parallax ? styles['Hero--parallax'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={heroClassName}>
      {/* Background */}
      {image && <div
        className={styles.background}
        style={{
          opacity: imageOpacity,
        }}
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          preload
          sizes="100vw"
          className={styles.backgroundImage}
        />
      </div>}

      {/* Overlay */}
      {overlay && (
        <div
          className={styles.overlay}
          style={{
            opacity: overlayOpacity,
          }}
        />
      )}

      {/* Content */}
      <div className={styles.content}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        {title && (
          <h1 className={styles.title}>
            {title}
          </h1>
        )}

        {description && (
          <p className={styles.description}>
            {description}
          </p>
        )}

        {actions.length > 0 && (
          <div className={styles.buttonContainer}>
            {actions.map((action) => (
              <Button
                key={action.label}
                type="button"
                href={action.href}
                priority={action.priority ?? 'primary'}
                classes={{
                  button: styles.button,
                }}
              >
                {action.label}

                {action.showIcon && (
                  <span aria-hidden="true">→</span>
                )}
              </Button>
            ))}
          </div>
        )}

        {subtitle && (
          <p className={styles.subtitle}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default Hero;
