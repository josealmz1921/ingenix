'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { ArrowTopRightOnSquareIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { AuthProvider, logout, useAdminAccess } from './AuthProvider';
import AdminNavigation from './AdminNavigation';
import { adminNavigation, isActiveAdminPath } from './navigation';
import styles from './admin.module.css';

function ProtectedShell({ children }: { children: ReactNode }) {
  const access = useAdminAccess();
  const pathname = usePathname();
  const [error, setError] = useState('');
  if (access.loading) {
    return (
      <main className={styles.center}>
        <p role="status">Comprobando acceso…</p>
      </main>
    );
  }

  if (!access.isAdmin) {
    return (
      <main className={styles.center}>
        <h1>Administración de Ingenix</h1>
        <p role="alert">
          {access.error ||
            (access.user
              ? 'Tu cuenta no tiene permiso de administrador.'
              : 'Inicia sesión para continuar.')}
        </p>
        <Link href="/login">Ir al acceso</Link>
      </main>
    );
  }

  const currentSection = adminNavigation.find((item) => isActiveAdminPath(pathname, item.href));
  async function handleLogout() {
    try {
      await logout();
    } catch {
      setError('No se pudo cerrar sesión.');
    }
  }
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#admin-content">
        Saltar al contenido
      </a>
      <AdminNavigation pathname={pathname} onLogout={handleLogout} />
      <div className={styles.mainArea}>
        <header className={styles.header}>
          <div className={styles.breadcrumb}>
            <span>Administración</span>
            <span aria-hidden="true">/</span>
            <strong>{currentSection?.label || 'Ingenix'}</strong>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.accessBadge}>
              <ShieldCheckIcon aria-hidden="true" />
              Administrador
            </span>
            <Link href="/" target="_blank" rel="noopener noreferrer">
              Ver sitio
              <ArrowTopRightOnSquareIcon aria-hidden="true" />
            </Link>
          </div>
        </header>
        {error && (
          <p role="alert" className={styles.errorMessage}>
            {error}
          </p>
        )}
        <div id="admin-content" tabIndex={-1} className={styles.pageOutlet}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedShell>{children}</ProtectedShell>
    </AuthProvider>
  );
}
