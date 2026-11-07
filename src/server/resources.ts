import 'server-only';
import { FieldValue } from 'firebase-admin/firestore';
import { emptyResource, isResource, type ResourceName } from '@/src/content/adminResources';
import { adminDb } from './firebaseAdmin';
import { ApiError, apiError, apiResponse, limitAdminRequests, readJson, requireAdmin } from './adminApi';
import { validateResource, validateResourceId } from './resourceValidation';
import { resourceCollection } from './contentStore';

function resolveResource(value: string): ResourceName {
  if (!isResource(value)) throw new ApiError(404, 'Sección no encontrada.');
  return value;
}

export async function readResources(request: Request, name: string, id?: string) {
  try {
    await requireAdmin(request);
    const resource = resolveResource(name);
    const collection = resourceCollection(resource);
    if (id) {
      const snapshot = await collection.doc(validateResourceId(resource, id)).get();
      if (!snapshot.exists && resource === 'contact') {
        return apiResponse({ id, revision: 0, document: emptyResource(resource) });
      }
      if (!snapshot.exists) throw new ApiError(404, 'Contenido no encontrado.');
      const data = snapshot.data()!;
      return apiResponse({ id: snapshot.id, revision: data.revision, document: data.document });
    }
    const url = new URL(request.url);
    const cursor = url.searchParams.get('after');
    let query = collection.orderBy('__name__').limit(50);
    if (cursor) query = query.startAfter(validateResourceId(resource, cursor));
    const snapshot = await query.get();
    return apiResponse({ records: snapshot.docs.map(doc => ({ id: doc.id, revision: doc.data().revision, document: doc.data().document })), next: snapshot.size === 50 ? snapshot.docs.at(-1)!.id : null });
  } catch (error) { return apiError(error); }
}

export async function writeResource(request: Request, name: string, id: string, remove = false) {
  try {
    const user = await requireAdmin(request);
    await limitAdminRequests(user.uid, 'content-write');
    const resource = resolveResource(name);
    validateResourceId(resource, id);
    const body = await readJson(request, 128 * 1024);
    if (Object.keys(body).some(key => !(remove ? ['revision'] : ['revision', 'document']).includes(key))
      || !Number.isSafeInteger(body.revision) || (body.revision as number) < 0) {
      throw new ApiError(400, 'Revisión o solicitud no válida.');
    }
    const document = remove ? null : validateResource(resource, body.document);
    const db = adminDb();
    const ref = resourceCollection(resource).doc(id);
    const revision = await db.runTransaction(async transaction => {
      const current = await transaction.get(ref);
      if ((current.data()?.revision ?? 0) !== body.revision) throw new ApiError(409, 'Otra sesión cambió el contenido. Recarga antes de continuar.');
      if (remove) {
        if (!current.exists) throw new ApiError(404, 'Contenido no encontrado.');
        transaction.delete(ref);
        return body.revision;
      }
      if (document?.categoryId) {
        const category = await transaction.get(resourceCollection('categories').doc(String(document.categoryId)));
        if (!category.exists) throw new ApiError(400, 'La categoría seleccionada ya no existe.');
        if (document.published && category.data()?.document?.published !== true) throw new ApiError(400, 'Publica la categoría antes de publicar este contenido.');
      }
      const next = (body.revision as number) + 1;
      transaction.set(ref, { document, revision: next, updatedAt: FieldValue.serverTimestamp() });
      return next;
    });
    return apiResponse({ revision });
  } catch (error) { return apiError(error); }
}
