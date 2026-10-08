import type { MetadataRoute } from 'next';
import { site } from '@/src/content/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    ...(site.url ? { sitemap: new URL('/sitemap.xml', site.url).href } : {}),
  };
}
