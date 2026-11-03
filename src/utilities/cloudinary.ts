import { adminHeaders } from '@/src/firebase/adminRequest';

export async function uploadImage(file: File): Promise<{ secure_url: string; public_id: string }> {
  if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    throw new Error('Usa una imagen JPG o PNG de hasta 5 MiB.');
  }
  const authorization = await fetch('/api/cloudinary/sign', {
    method: 'POST', headers: await adminHeaders(), body: JSON.stringify({ resourceType: 'image' }),
  });
  const signed = await authorization.json();
  if (!authorization.ok) throw new Error(`${signed.error || 'No se pudo autorizar la subida.'} (HTTP ${authorization.status})`);
  const body = new FormData();
  body.append('file', file);
  for (const [key, value] of Object.entries(signed.params)) body.append(key, String(value));
  body.append('signature', signed.signature);
  body.append('api_key', signed.apiKey);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`, { method: 'POST', body });
  const uploaded = await response.json();
  if (!response.ok || typeof uploaded.secure_url !== 'string' || typeof uploaded.public_id !== 'string') {
    throw new Error('No se pudo subir la imagen. Revisa el preset firmado de Cloudinary.');
  }
  return uploaded;
}
