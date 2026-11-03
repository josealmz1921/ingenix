import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicRecord, isPublicSection } from '@/src/server/publicContent';
import ContentArticle from '@/src/components/PublicContent/ContentArticle';
import styles from '@/src/components/Admin/admin.module.css';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ section: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, id } = await params;
  if (!isPublicSection(section) || section === 'empresa') notFound();
  const record = await getPublicRecord(section, id);
  if (!record) notFound();
  const title = String(record.document.title);
  const description = String(record.document.description);
  return { title, description, alternates: { canonical: `/${section}/${id}` }, openGraph: { title, description }, twitter: { title, description } };
}

export default async function PublicDetail({ params }: Props) {
  const { section, id } = await params;
  if (!isPublicSection(section) || section === 'empresa') notFound();
  const record = await getPublicRecord(section, id);
  if (!record) notFound();
  return <main id="contenido" className={styles.article}><Link href={`/${section}`}>← Volver</Link><ContentArticle record={record} /></main>;
}
