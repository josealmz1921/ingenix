import Link from 'next/link';
import { homeNavigation } from '@/src/content/home';
import { emptyContact, hasContactData, type PublicContact } from '@/src/content/contact';
import ContactLinks from '@/src/components/Contact/ContactLinks';
import styles from './Footer.module.css';

type Props = {
  navigation?: { label: string; href: string }[];
  companyAvailable?: boolean;
  contact?: PublicContact;
};

const Footer = ({
  navigation = homeNavigation,
  companyAvailable = false,
  contact = emptyContact,
}: Props) => {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} ${hasContactData(contact) ? '' : styles.withoutContact}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandName}>
            Ingenix.
          </Link>
          <p>Desarrollo de software a medida para empresas. Tecnología pensada para tu negocio.</p>
        </div>
        <nav className={styles.column} aria-label="Navegación del pie de página">
          <h2>Conoce Ingenix</h2>
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/servicios">Catálogo de servicios</Link>
          <Link href="/proyectos">Portafolio</Link>
          <Link href="/blog">Blog</Link>
          {companyAvailable && (
            <Link href="/empresa">Nuestra empresa</Link>
          )}
        </nav>
        {hasContactData(contact) && (
          <div className={styles.column}>
            <h2>Construyamos juntos</h2>
            <ContactLinks contact={contact} />
          </div>
        )}
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Ingenix. Todos los derechos reservados.</p>
        <p>Software con propósito.</p>
      </div>
    </footer>
  );
};

export default Footer;
