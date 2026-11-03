import 'server-only';
import { apiError, apiResponse, requireAdmin } from './adminApi';
import { getPublishedCatalog } from './publicContent';

export async function getPageCatalogs(request: Request) {
  try {
    await requireAdmin(request);
    const [services, projects] = await Promise.all([
      getPublishedCatalog('services'),
      getPublishedCatalog('projects'),
    ]);
    return apiResponse({ services, projects });
  } catch (error) {
    return apiError(error);
  }
}
