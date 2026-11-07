import { homePage } from '@/src/content/home';
import HomePageRenderer from '@/src/components/Contact/HomePageRenderer';
import styles from './Home.module.css';
import type { Metadata } from 'next';
import { getPublishedHome } from '@/src/server/publishedHome';
import { getHomeContent } from '@/src/server/homeContent';
import { getPublicContact } from '@/src/server/publicContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedHome() ?? homePage;
  const title = page.seo?.title || homePage.seo!.title;
  const description = page.seo?.description || homePage.seo!.description;
  return { title: { absolute: title! }, description, alternates: { canonical: '/' }, openGraph: { title, description }, twitter: { title, description } };
}

export default async function Home() {
  const [page, contact] = await Promise.all([getHomeContent(), getPublicContact()]);
  return (
    <main id="contenido" className={styles.home}>
      <HomePageRenderer page={page} contact={contact} />
    </main>
  );
}
