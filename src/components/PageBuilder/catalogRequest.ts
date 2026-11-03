import type { ResourceRecord } from '@/src/content/adminResources';
import { adminHeaders } from '@/src/firebase/adminRequest';

export type PageCatalogs = { services: ResourceRecord[]; projects: ResourceRecord[] };
export const emptyCatalogs: PageCatalogs = { services: [], projects: [] };

export async function loadPageCatalogs(): Promise<PageCatalogs> {
  const response = await fetch('/api/admin/pages/catalogs', {
    headers: await adminHeaders(),
    cache: 'no-store',
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudieron cargar los catálogos.');
  if (!Array.isArray(result.services) || !Array.isArray(result.projects)) {
    throw new Error('La respuesta de los catálogos no es válida.');
  }
  return result;
}
