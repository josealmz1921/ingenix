import { homePage } from '@/src/content/home';
import { PageRenderer } from '@/src/page-builder';
import styles from './Home.module.css';

export default function Home() {
  return (
    <main id="contenido" className={styles.home}>
      <PageRenderer document={homePage} />
    </main>
  );
}
