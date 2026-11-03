import type { ResourceRecord } from './adminResources';
import type {
  CardContent,
  CatalogSelection,
  PageDocument,
  PageSection,
  ProjectContent,
} from '@/src/page-builder/types/page';

export function isCatalogSection(section: PageSection) {
  return (
    (section.type === 'cards' || section.type === 'projects') &&
    Boolean(section.catalog && section.catalog.mode !== 'static')
  );
}

/** Backward-compatible migration in memory; persistence happens only on an explicit save. */
export function normalizeHomeCatalogs(page: PageDocument): PageDocument {
  return {
    ...page,
    sections: page.sections.map((section) => {
      if (section.type !== 'cards' && section.type !== 'projects') return section;
      const legacy =
        (section.type === 'cards' && section.id === 'servicios') ||
        (section.type === 'projects' && section.id === 'proyectos');
      const catalog = section.catalog ?? (legacy ? { mode: 'all' as const, items: [] } : undefined);
      if (!catalog || catalog.mode === 'static') return section;
      if (section.type === 'cards') {
        return { ...section, catalog, content: { ...section.content, items: [] } };
      }
      return { ...section, catalog, content: { ...section.content, items: [] } };
    }),
  };
}

function selectedRecords(records: ResourceRecord[], selection: CatalogSelection): ResourceRecord[] {
  const published = records.filter((record) => record.document.published === true);
  if (selection.mode === 'all') return published.slice(0, 100);
  const byId = new Map(published.map((record) => [record.id, record]));
  return selection.items.flatMap(({ recordId }) => {
    const record = byId.get(recordId);
    return record ? [record] : [];
  });
}

function catalogCard(record: ResourceRecord, path: string): CardContent {
  const { document, id } = record;
  const title = String(document.title);

  return {
    id,
    title,
    description: String(document.description),
    ...(document.image
      ? {
          image: { src: String(document.image), alt: String(document.imageAlt || title) },
        }
      : {}),
    link: { text: 'Ver detalles', href: `${path}/${id}` },
  };
}

/** Runtime projection only: never mutates saved pages or copies catalogue data into drafts. */
export function composeHomeCatalogs(
  page: PageDocument,
  services: ResourceRecord[],
  projects: ResourceRecord[],
): PageDocument {
  function projectCard(record: ResourceRecord): ProjectContent {
    const card = catalogCard(record, '/proyectos');

    return {
      ...card,
      company: String(record.document.company || ''),
      category: String(record.document.categoryLabel || ''),
      ...(record.document.logo
        ? {
            logo: {
              src: String(record.document.logo),
              alt: String(record.document.logoAlt || record.document.company || card.title),
            },
          }
        : {}),
    };
  }

  return {
    ...page,
    sections: normalizeHomeCatalogs(page).sections.map((section) => {
      if (section.type === 'cards' && section.catalog && section.catalog.mode !== 'static') {
        const items = selectedRecords(services, section.catalog).map((record) =>
          catalogCard(record, '/servicios'),
        );
        return { ...section, content: { ...section.content, items } };
      }

      if (section.type === 'projects' && section.catalog && section.catalog.mode !== 'static') {
        const items = selectedRecords(projects, section.catalog).map(projectCard);
        return { ...section, content: { ...section.content, items } };
      }

      return section;
    }),
  };
}
