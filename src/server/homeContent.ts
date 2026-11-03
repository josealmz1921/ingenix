import 'server-only';
import { cache } from 'react';
import { homePage } from '@/src/content/home';
import { composeHomeCatalogs } from '@/src/content/homeCatalogs';
import { getPublicList } from './publicContent';
import { getPublishedHome } from './publishedHome';

/** Published catalogue readers validate records and never expose drafts. */
export const getHomeContent = cache(async () => {
  const [published, services, projects] = await Promise.all([
    getPublishedHome(),
    getPublicList('servicios'),
    getPublicList('proyectos'),
  ]);

  return composeHomeCatalogs(published ?? homePage, services.records, projects.records);
});
