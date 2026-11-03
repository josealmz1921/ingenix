import { readResources, writeResource } from '@/src/server/resources';
export const runtime = 'nodejs';
type Context = { params: Promise<{ resource: string; id: string }> };
export async function GET(request: Request, { params }: Context) {
  const { resource, id } = await params;
  return readResources(request, resource, id);
}
export async function PUT(request: Request, { params }: Context) {
  const { resource, id } = await params;
  return writeResource(request, resource, id);
}
export async function DELETE(request: Request, { params }: Context) {
  const { resource, id } = await params;
  return writeResource(request, resource, id, true);
}
