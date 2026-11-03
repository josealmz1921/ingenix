import { emptyResource, type ResourceDocument, type ResourceName } from './adminResources';
import type { PageSection } from '@/src/page-builder/types/page';

export type CatalogImportEntry = {
  resource: Extract<ResourceName, 'services' | 'projects'>;
  id: string;
  document: ResourceDocument;
};

/** Import only the two original catalogue sections, never experience cards or page drafts. */
export function prepareCatalogImport(sections: PageSection[]): CatalogImportEntry[] {
  const services = sections.find((section) => section.id === 'servicios');
  const projects = sections.find((section) => section.id === 'proyectos');

  if (services?.type !== 'cards' || projects?.type !== 'projects') {
    throw new Error('No se encontraron las secciones originales de servicios y proyectos.');
  }

  const serviceEntries: CatalogImportEntry[] = services.content.items.map((item) => ({
    resource: 'services',
    id: item.id,
    document: {
      ...emptyResource('services'),
      published: true,
      title: item.title,
      description: item.description,
      image: item.image?.src || '',
      imageAlt: item.image?.alt || '',
      url: item.link?.href || '',
    },
  }));

  const projectEntries: CatalogImportEntry[] = projects.content.items.map((item) => ({
    resource: 'projects',
    id: item.id,
    document: {
      ...emptyResource('projects'),
      // Fail closed: only the two identified real projects are published during migration.
      published: item.id === 'kaband' || item.id === 'bientasty',
      title: item.title,
      description: item.description,
      image: item.image?.src || '',
      imageAlt: item.image?.alt || '',
      url: item.link?.href || '',
      company: item.company,
      categoryLabel: item.category,
      logo: item.logo?.src || '',
      logoAlt: item.logo?.alt || '',
    },
  }));

  return [...serviceEntries, ...projectEntries];
}
