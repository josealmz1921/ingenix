import type { MetadataRoute } from 'next';
import { site } from '@/src/content/site';
import { getPublicList, getPublicRecord, type PublicSection } from '@/src/server/publicContent';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!site.url) return [];
  const entries: MetadataRoute.Sitemap = [{ url: new URL('/', site.url).href, changeFrequency: 'monthly', priority: 1 }];
  await Promise.all((['servicios', 'proyectos', 'blog'] as PublicSection[]).map(async section => {
    entries.push({ url: new URL(`/${section}`, site.url).href });
    let cursor = '';
    do {
      const page = await getPublicList(section, cursor);
      entries.push(...page.records.map(record => ({ url: new URL(`/${section}/${record.id}`, site.url).href })));
      cursor = page.next ?? '';
    } while (cursor);
  }));
  if (await getPublicRecord('empresa', 'profile')) entries.push({ url: new URL('/empresa', site.url).href });
  return entries;
}
