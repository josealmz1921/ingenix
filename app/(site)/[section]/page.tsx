import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicList, getPublicRecord, isPublicSection, publicSections } from '@/src/server/publicContent';
import { resourceDefinitions } from '@/src/content/adminResources';
import ContentArticle from '@/src/components/PublicContent/ContentArticle';
import styles from '@/src/components/Admin/admin.module.css';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ section: string }>; searchParams: Promise<{ after?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  if (!isPublicSection(section)) return {};
  if (section === 'empresa') {
    const company = await getPublicRecord(section, 'profile');
    if (!company) notFound();
    const title = String(company.document.title);
    const description = String(company.document.description);
    return { title, description, alternates: { canonical: '/empresa' }, openGraph: { title, description }, twitter: { title, description } };
  }
  const title = resourceDefinitions[publicSections[section]].label;
  return { title, alternates: { canonical: `/${section}` }, openGraph: { title }, twitter: { title } };
}

export default async function PublicList({ params, searchParams }: Props) {
  const { section } = await params;
  if (!isPublicSection(section)) notFound();
  if (section === 'empresa') {
    const record = await getPublicRecord(section, 'profile');
    if (!record) notFound();
    return <main id="contenido" className={styles.article}><ContentArticle record={record} /></main>;
  }
  const { after = '' } = await searchParams;
  const page = await getPublicList(section, after);
  return <main id="contenido" className={styles.article}>
    <h1>{resourceDefinitions[publicSections[section]].label}</h1>
    {!page.records.length && <p>Próximamente compartiremos contenido aquí.</p>}
    {page.records.map(record => <article key={record.id}><h2><Link href={`/${section}/${record.id}`}>{String(record.document.title)}</Link></h2><p>{String(record.document.description)}</p></article>)}
    {page.next && <Link href={`/${section}?after=${encodeURIComponent(page.next)}`}>Siguiente página →</Link>}
  </main>;
}
