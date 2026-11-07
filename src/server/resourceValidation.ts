import { resourceDefinitions, type ResourceDocument, type ResourceName } from '@/src/content/adminResources';
import { isAllowedImageSource } from '@/src/utilities/pageBuilder';
import { ApiError } from './adminApi';

export function validateResourceId(resource: ResourceName, id: string) {
  if (id === 'new' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 100
    || (resourceDefinitions[resource].singleton && id !== 'profile')) {
    throw new ApiError(400, 'Identificador no válido. Usa letras minúsculas, números y guiones.');
  }
  return id;
}

export function validateResource(resource: ResourceName, input: unknown): ResourceDocument {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ApiError(400, 'Contenido no válido.');
  const raw = input as Record<string, unknown>;
  const definition = resourceDefinitions[resource];
  const allowed = new Set(['published', ...definition.fields.map(field => field.key)]);
  if (Object.keys(raw).some(key => !allowed.has(key)) || typeof raw.published !== 'boolean') {
    throw new ApiError(400, 'Campos no permitidos o estado de publicación no válido.');
  }
  const result: ResourceDocument = { published: raw.published };
  for (const field of definition.fields) {
    if (field.kind === 'checkbox') {
      const value = raw[field.key] ?? false;
      if (typeof value !== 'boolean') throw new ApiError(400, `${field.label}: valor no válido.`);
      result[field.key] = value;
      continue;
    }
    const value = raw[field.key] ?? '';
    if (typeof value !== 'string' || value.length > field.max) throw new ApiError(400, `${field.label}: máximo ${field.max} caracteres.`);
    const text = value.trim();
    if (field.required && !text) throw new ApiError(400, `${field.label} es obligatorio.`);
    if (text && field.kind === 'url') {
      let valid = false;
      try { const url = new URL(text); valid = url.protocol === 'https:' && !url.username && !url.password; } catch { /* Invalid URL. */ }
      if (!valid) throw new ApiError(400, 'Usa un enlace HTTPS sin credenciales.');
    }
    if (text && field.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) throw new ApiError(400, 'Correo no válido.');
    if (text && field.kind === 'phone') {
      const digits = text.replace(/\D/g, '').length;
      const valid = field.key === 'whatsapp' ? /^[1-9]\d{6,14}$/.test(text) : /^\+?[1-9][\d\s()-]{5,39}$/.test(text) && digits >= 7 && digits <= 15;
      if (!valid) throw new ApiError(400, `${field.label}: usa un número internacional válido.`);
    }
    if (text && field.kind === 'category') validateResourceId('categories', text);
    if (text && field.kind === 'image') {
      // Same image policy as the page builder and next/image; no arbitrary hosts.
      if (!isAllowedImageSource(text)) throw new ApiError(400, 'Usa imágenes locales de /img/ o del Cloudinary configurado.');
    }
    result[field.key] = text;
  }
  if (result.image && !result.imageAlt) throw new ApiError(400, 'Describe la imagen para accesibilidad.');
  if (result.logo && !result.logoAlt) throw new ApiError(400, 'Describe el logo para accesibilidad.');
  return result;
}
