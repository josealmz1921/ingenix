import 'server-only';
import { cache } from 'react';
import { homePage } from '@/src/content/home';
import { composeHomeCatalogs } from '@/src/content/homeCatalogs';
import { getPublishedCatalog, getPublicContact } from './publicContent';
import { composeHomeContact } from '@/src/content/contact';
import { getPublishedHome } from './publishedHome';

/** Published catalogue readers validate records and never expose drafts. */
export const getHomeContent = cache(async () => {
  const [published, services, projects, contact] = await Promise.all([
    getPublishedHome(),
    getPublishedCatalog('services'),
    getPublishedCatalog('projects'),
    getPublicContact(),
  ]);

  return composeHomeContact(composeHomeCatalogs(published ?? homePage, services, projects), contact);
});
