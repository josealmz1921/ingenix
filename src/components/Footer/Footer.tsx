import type { FC } from 'react';
import Link from 'next/link';
import { homeNavigation } from '@/src/content/home';
import { site } from '@/src/content/site';
import styles from './Footer.module.css';

const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandName}>Ingenix.</Link>
          <p>Desarrollo de software a medida para empresas. Tecnología pensada para tu negocio.</p>
        </div>
        <nav className={styles.column} aria-label="Navegación del pie de página">
          <h2>Conoce Ingenix</h2>
          {homeNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className={styles.column}>
          <h2>Construyamos juntos</h2>
          <Link href="/#contacto">Hablemos de tu proyecto</Link>
          {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
        </div>
      </div>
      <div className={styles.bottom}><p>© {new Date().getFullYear()} Ingenix. Todos los derechos reservados.</p><p>Software con propósito.</p></div>
    </footer>
  );
};

export default Footer;
