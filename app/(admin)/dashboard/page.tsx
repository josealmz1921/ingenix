import Link from 'next/link';
import { resourceDefinitions } from '@/src/content/adminResources';
import { adminNavigation } from '@/src/components/Admin/navigation';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import styles from '@/src/components/Admin/admin.module.css';

export default function Dashboard() {
  return (
    <main className={styles.content}>
      <span className={styles.eyebrow}>Tu espacio de trabajo</span>
      <h1>Administra Ingenix</h1>
      <p>Edita la portada, servicios, proyectos, categorías, blog y perfil de empresa.</p>
      <div className={styles.cards}>
        {adminNavigation
          .filter((item) => item.href !== '/dashboard')
          .map(({ href, label, Icon }) => {
            const resource = Object.entries(resourceDefinitions).find(
              ([key]) => href === `/dashboard/${key}`,
            )?.[1];
            return (
              <Link key={href} href={href} className={styles.card}>
                <span className={styles.cardIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <ArrowUpRightIcon className={styles.cardArrow} aria-hidden="true" />
                <h2>{label}</h2>
                <p>
                  {resource
                    ? `Administrar ${resource.label.toLowerCase()}.`
                    : 'Constructor visual, SEO, borradores y publicación del inicio.'}
                </p>
              </Link>
            );
          })}
      </div>
      <p className={styles.notice}>
        Los servicios y proyectos publicados aparecen automáticamente en sus secciones de la
        portada y en sus páginas públicas. Los títulos, el diseño y la visibilidad de esas secciones
        se administran desde Páginas. El blog y la empresa conservan sus páginas propias.
      </p>
    </main>
  );
}
