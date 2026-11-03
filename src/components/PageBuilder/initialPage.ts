import { homePage } from '@/src/content/home';
import type { PageDocument } from '@/src/page-builder/editor';

/** Independent local copy. Loading a template never writes to Firestore. */
export function initialPage(): PageDocument {
  return structuredClone({ ...homePage, id: 'home' });
}
