'use client';

import type { FC } from 'react';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

import Button from '@/src/components/Button/Button';

import styles from './Hero.module.css';

import { HeroProps } from './HeroProps.types';

const Hero: FC<HeroProps> = ({
  title = 'Software que convierte ideas en soluciones reales.',
  description = 'Diseñamos y desarrollamos aplicaciones, sitios web, tiendas online y soluciones digitales a la medida de tu negocio.',
  subtitle = 'Desarrollo personalizado. Tecnología moderna. Sin soluciones genéricas.',

  image = '/img/hero-image.jpg',
  imageAlt = 'Soluciones digitales',

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
    styles[`Hero--${verticalAlignment}`],
    parallax ? styles['Hero--parallax'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={heroClassName}>
      {/* Background */}
      <div
        className={styles.background}
        style={{
          opacity: imageOpacity,
        }}
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className={styles.backgroundImage}
        />
      </div>

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
                priority={action.priority ?? 'primary'}
                classes={{
                  button: styles.button,
                }}
              >
                {action.label}

                {action.showIcon && (
                  <ArrowRightIcon className={styles.icon} />
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