import { homePage } from '@/src/content/home';
import { PageRenderer } from '@/src/page-builder';
import styles from './Home.module.css';
import type { Metadata } from 'next';
import { getPublishedHome } from '@/src/server/publishedHome';
import { getHomeContent } from '@/src/server/homeContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedHome() ?? homePage;
  const title = page.seo?.title || homePage.seo!.title;
  const description = page.seo?.description || homePage.seo!.description;
  return { title: { absolute: title! }, description, alternates: { canonical: '/' }, openGraph: { title, description }, twitter: { title, description } };
}

export default async function Home() {
  const page = await getHomeContent();
  return (
    <main id="contenido" className={styles.home}>
      <PageRenderer document={page} />
    </main>
  );
}
