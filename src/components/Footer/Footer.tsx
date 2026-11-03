import Link from 'next/link';
import { homeNavigation } from '@/src/content/home';
import { site } from '@/src/content/site';
import styles from './Footer.module.css';

const Footer = ({ navigation = homeNavigation, companyAvailable = false }: { navigation?: { label: string; href: string }[]; companyAvailable?: boolean }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandName}>Ingenix.</Link>
          <p>Desarrollo de software a medida para empresas. Tecnología pensada para tu negocio.</p>
        </div>
        <nav className={styles.column} aria-label="Navegación del pie de página">
          <h2>Conoce Ingenix</h2>
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <Link href="/servicios">Catálogo de servicios</Link>
          <Link href="/proyectos">Portafolio</Link>
          <Link href="/blog">Blog</Link>
          {companyAvailable && <Link href="/empresa">Nuestra empresa</Link>}
        </nav>
        <div className={styles.column}>
          <h2>Construyamos juntos</h2>
          {navigation.some(item => item.href.endsWith('#contacto')) && <Link href="/#contacto">Hablemos de tu proyecto</Link>}
          {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
        </div>
      </div>
      <div className={styles.bottom}><p>© {new Date().getFullYear()} Ingenix. Todos los derechos reservados.</p><p>Software con propósito.</p></div>
    </footer>
  );
};

export default Footer;
