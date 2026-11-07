import { notFound, redirect } from 'next/navigation';
import { isResource } from '@/src/content/adminResources';
import ResourceEditor from '@/src/components/Admin/ResourceEditor';

export default async function EditResource({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  if (!isResource(resource)) notFound();
  if (resource === 'contact') redirect('/dashboard/settings/contact');
  return (
    <ResourceEditor key={`${resource}/${id}`} resource={resource} id={id} />
  );
}
