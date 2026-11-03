import 'server-only';
import type { ResourceName } from '@/src/content/adminResources';
import { adminDb } from './firebaseAdmin';

/** Only a validated resource name can select a collection in this namespace. */
export function resourceCollection(resource: ResourceName) {
  return adminDb().collection(`cms_${resource}`);
}
