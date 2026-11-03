import 'server-only';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import type { CatalogImportEntry } from '@/src/content/catalogImport';
import { validateResource, validateResourceId } from './resourceValidation';

/** Create-only migration. A repeated run never changes records, revisions or publication states. */
export async function importCatalogEntries(db: Firestore, input: CatalogImportEntry[], apply = false) {
  const entries = input.map((entry) => {
    if (entry.resource !== 'services' && entry.resource !== 'projects') {
      throw new Error('La importación solo admite servicios y proyectos.');
    }

    return {
      ...entry,
      id: validateResourceId(entry.resource, entry.id),
      document: validateResource(entry.resource, entry.document),
    };
  });
  const refs = entries.map((entry) => db.collection(`cms_${entry.resource}`).doc(entry.id));
  if (new Set(refs.map((ref) => ref.path)).size !== entries.length) {
    throw new Error('La importación contiene identificadores duplicados.');
  }
  if (!entries.length) return [];

  // All reads precede writes; create() prevents overwriting concurrent edits.
  const existing = apply
    ? await db.runTransaction(async (transaction) => {
      const snapshots = await transaction.getAll(...refs);
      snapshots.forEach((snapshot, index) => {
        if (!snapshot.exists) {
          transaction.create(refs[index], {
            document: entries[index].document,
            revision: 1,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });
      return snapshots.map((snapshot) => snapshot.exists);
    })
    : (await db.getAll(...refs)).map((snapshot) => snapshot.exists);

  return entries.map((entry, index) => ({
    path: refs[index].path,
    published: entry.document.published,
    skipped: existing[index],
  }));
}
