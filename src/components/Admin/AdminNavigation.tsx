import Link from 'next/link';
import { ArrowLeftOnRectangleIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import { adminNavigation, isActiveAdminPath } from './navigation';
import styles from './admin.module.css';

type Props = { pathname: string; onLogout: () => void };

export default function AdminNavigation({ pathname, onLogout }: Props) {
  return (
    <aside className={styles.sidebar}>
      <Link href="/dashboard" className={styles.brand} aria-label="Ingenix · Administración">
        <span className={styles.brandMark}>
          <CommandLineIcon />
        </span>
        <span>
          <strong>
            Ingenix<span>.</span>
          </strong>
          <small>Administración</small>
        </span>
      </Link>
      <span className={styles.navHeading}>Espacio de trabajo</span>
      <nav className={styles.navigation} aria-label="Administración">
        {adminNavigation.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActiveAdminPath(pathname, href) ? 'page' : undefined}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className={styles.sidebarFooter}>
        <p>
          <span className={styles.statusDot} />
          Acceso administrativo
        </p>
        <button type="button" onClick={onLogout}>
          <ArrowLeftOnRectangleIcon aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
