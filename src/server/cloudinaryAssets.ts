import 'server-only';
import { ApiError } from './adminApi';

export function assetFolder() {
  const folder = process.env.CLOUDINARY_ASSET_FOLDER;
  if (!folder || !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(folder)) {
    throw new Error('Configura una carpeta exclusiva de Cloudinary para Ingenix.');
  }
  return folder;
}

export function validatePublicId(value: unknown): string {
  if (typeof value !== 'string' || value.length > 255 || !/^[a-zA-Z0-9_./-]+$/.test(value)
    || value.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new ApiError(400, 'Identificador de archivo no válido.');
  }
  return value;
}

export async function assertManagedImage(publicId: string) {
  // No legacy-account exception: this installation may only manage its own folder.
  if (!publicId.startsWith(`${assetFolder()}/`)) throw new ApiError(403, 'El archivo no pertenece a este sitio.');
}
