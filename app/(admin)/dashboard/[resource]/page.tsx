import { notFound, redirect } from 'next/navigation';
import { isResource } from '@/src/content/adminResources';
import ResourceList from '@/src/components/Admin/ResourceList';

export default async function Resources({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!isResource(resource)) notFound();
  if (resource === 'contact') redirect('/dashboard/settings/contact');
  return (
    <ResourceList key={resource} resource={resource} />
  );
}
