import type { MetadataRoute } from 'next';
import { site } from '@/src/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return site.url ? [{ url: new URL('/', site.url).href, changeFrequency: 'monthly', priority: 1 }] : [];
}
