import 'server-only';
import { apiError, apiResponse, requireAdmin } from './adminApi';
import { getPublishedCatalog, getPublicContact } from './publicContent';

export async function getPageCatalogs(request: Request) {
  try {
    await requireAdmin(request);
    const [services, projects, contact] = await Promise.all([
      getPublishedCatalog('services'),
      getPublishedCatalog('projects'),
      getPublicContact(),
    ]);
    return apiResponse({ services, projects, contact });
  } catch (error) {
    return apiError(error);
  }
}
