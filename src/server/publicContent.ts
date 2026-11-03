import 'server-only';
import { cache } from 'react';
import type { ResourceName, ResourceRecord } from '@/src/content/adminResources';
import { resourceCollection } from './contentStore';
import { validateResource, validateResourceId } from './resourceValidation';

export const publicSections = { servicios: 'services', proyectos: 'projects', blog: 'blog', empresa: 'company' } as const;
export type PublicSection = keyof typeof publicSections;
export function isPublicSection(section: string): section is PublicSection {
  return Object.hasOwn(publicSections, section);
}

async function boundedRead<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return fallback;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([operation(), new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error('Public content timeout')), 4000);
    })]);
  } catch {
    console.warn('Public content unavailable');
    return fallback;
  } finally { if (timeout) clearTimeout(timeout); }
}

/** Explicit public projection. Never return envelopes, drafts, credentials or arbitrary fields. */
function publicRecord(resource: ResourceName, id: string, raw: unknown): ResourceRecord | null {
  try {
    const stored = raw as { document?: unknown; revision?: number };
    const document = validateResource(resource, stored?.document);
    validateResourceId(resource, id);
    if (!document.published) return null;
    return { id, revision: 0, document };
  } catch { return null; }
}

export const getPublicList = cache(async (section: PublicSection, after = '') => boundedRead(async () => {
  const resource = publicSections[section];
  let query = resourceCollection(resource).where('document.published', '==', true).orderBy('__name__').limit(25);
  if (after) query = query.startAfter(validateResourceId(resource, after));
  const snapshot = await query.get();
  const records = snapshot.docs.map(doc => publicRecord(resource, doc.id, doc.data())).filter((record): record is ResourceRecord => record !== null);
  return { records, next: snapshot.size === 25 ? snapshot.docs.at(-1)!.id : null };
}, { records: [] as ResourceRecord[], next: null as string | null }));

export const getPublicRecord = cache(async (section: PublicSection, id: string) => boundedRead(async () => {
  const resource = publicSections[section];
  validateResourceId(resource, id);
  const snapshot = await resourceCollection(resource).doc(id).get();
  return snapshot.exists ? publicRecord(resource, id, snapshot.data()) : null;
}, null));

/** Whole published catalogue for curated home blocks, not only the first listing page. */
export const getPublishedCatalog = cache(async (resource: 'services' | 'projects') => boundedRead(async () => {
  const snapshot = await resourceCollection(resource).where('document.published', '==', true).orderBy('__name__').get();
  return snapshot.docs
    .map(doc => publicRecord(resource, doc.id, doc.data()))
    .filter((record): record is ResourceRecord => record !== null);
}, [] as ResourceRecord[]));
