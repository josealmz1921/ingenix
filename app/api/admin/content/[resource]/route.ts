import { readResources } from '@/src/server/resources';
export const runtime = 'nodejs';
export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  return readResources(request, (await params).resource);
}
