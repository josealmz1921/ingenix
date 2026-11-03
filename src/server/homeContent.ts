import 'server-only';
import { cache } from 'react';
import { homePage } from '@/src/content/home';
import { composeHomeCatalogs } from '@/src/content/homeCatalogs';
import { getPublishedCatalog } from './publicContent';
import { getPublishedHome } from './publishedHome';

/** Published catalogue readers validate records and never expose drafts. */
export const getHomeContent = cache(async () => {
  const [published, services, projects] = await Promise.all([
    getPublishedHome(),
    getPublishedCatalog('services'),
    getPublishedCatalog('projects'),
  ]);

  return composeHomeCatalogs(published ?? homePage, services, projects);
});
