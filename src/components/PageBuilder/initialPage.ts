import { homePage } from '@/src/content/home';
import type { PageDocument } from '@/src/page-builder/editor';
import { normalizeHomeCatalogs } from '@/src/content/homeCatalogs';

/** Independent local copy. Loading a template never writes to Firestore. */
export function initialPage(): PageDocument {
  return normalizeHomeCatalogs(structuredClone({ ...homePage, id: 'home' }));
}
