import { homeSections } from '@/src/content/home';
import SectionRenderer from '@/src/features/page-builder/SectionRenderer';
import styles from './Home.module.css';

export default function Home() {
  return (
    <main id="contenido" className={styles.home}>
      {homeSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </main>
  );
}
