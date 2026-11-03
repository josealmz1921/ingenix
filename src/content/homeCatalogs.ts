import type { ResourceRecord } from './adminResources';
import type { CardContent, PageDocument, ProjectContent } from '@/src/page-builder/types/page';

function catalogCard(record: ResourceRecord, path: string): CardContent {
  const { document, id } = record;
  const title = String(document.title);

  return {
    id,
    title,
    description: String(document.description),
    ...(document.image ? {
      image: { src: String(document.image), alt: String(document.imageAlt || title) },
    } : {}),
    link: { text: 'Ver detalles', href: `${path}/${id}` },
  };
}

/** Runtime projection only: never mutates saved pages or copies catalogue data into drafts. */
export function composeHomeCatalogs(
  page: PageDocument,
  services: ResourceRecord[],
  projects: ResourceRecord[],
): PageDocument {
  const serviceCards = services
    .filter((record) => record.document.published === true)
    .map((record) => catalogCard(record, '/servicios'));
  const projectCards: ProjectContent[] = projects
    .filter((record) => record.document.published === true)
    .map((record) => {
      const card = catalogCard(record, '/proyectos');

      return {
        ...card,
        company: '',
        category: '',
        image: card.image ?? { src: '', alt: '' },
      };
    });

  return {
    ...page,
    sections: page.sections.map((section) => {
      if (section.id === 'servicios' && section.type === 'cards') {
        return { ...section, content: { ...section.content, items: serviceCards } };
      }

      if (section.id === 'proyectos' && section.type === 'projects') {
        return { ...section, content: { ...section.content, items: projectCards } };
      }

      return section;
    }),
  };
}
