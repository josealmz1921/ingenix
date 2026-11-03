import Image from 'next/image';
import type { ResourceRecord } from '@/src/content/adminResources';
import styles from '@/src/components/Admin/admin.module.css';

/** Plain text is deliberately rendered through React escaping, never innerHTML. */
export default function ContentArticle({ record }: { record: ResourceRecord }) {
  const content = record.document;
  return <article>
    <h1>{String(content.title)}</h1><p>{String(content.description || '')}</p>
    {content.image && <Image src={String(content.image)} alt={String(content.imageAlt || '')} width={1200} height={630} className={styles.publicImage} />}
    {content.body && <p>{String(content.body)}</p>}
    {content.email && <p><a href={`mailto:${content.email}`}>{String(content.email)}</a></p>}
    {content.url && <p><a href={String(content.url)} target="_blank" rel="noopener noreferrer">Visitar sitio ↗</a></p>}
  </article>;
}
