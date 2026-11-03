import { adminHeaders } from '@/src/firebase/adminRequest';

export async function contentRequest(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(`/api/admin/content/${path}`, {
    method, headers: await adminHeaders(), cache: 'no-store',
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la operación.');
  return data;
}
