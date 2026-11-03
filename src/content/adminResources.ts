/** Shared form metadata. Validation and persistence remain server responsibilities. */
export type ResourceName = 'services' | 'categories' | 'projects' | 'blog' | 'company';
export type ContentField = { key: string; label: string; kind: 'text' | 'textarea' | 'image' | 'url' | 'email' | 'category'; max: number; required?: boolean };
type ResourceDefinition = { label: string; singular: string; publicPath: string; fields: ContentField[]; singleton?: boolean };

const title: ContentField = { key: 'title', label: 'Título', kind: 'text', max: 160, required: true };
const description: ContentField = { key: 'description', label: 'Descripción breve / SEO', kind: 'textarea', max: 320, required: true };
const body: ContentField = { key: 'body', label: 'Contenido (texto plano)', kind: 'textarea', max: 40000 };
const image: ContentField = { key: 'image', label: 'Imagen', kind: 'image', max: 2048 };
const imageAlt: ContentField = { key: 'imageAlt', label: 'Descripción de la imagen', kind: 'text', max: 240 };
const category: ContentField = { key: 'categoryId', label: 'Categoría', kind: 'category', max: 100 };
const url: ContentField = { key: 'url', label: 'Enlace externo (https)', kind: 'url', max: 2048 };

export const resourceDefinitions: Record<ResourceName, ResourceDefinition> = {
  services: { label: 'Servicios', singular: 'Servicio', publicPath: '/servicios', fields: [title, description, body, image, imageAlt, category, url] },
  categories: { label: 'Categorías', singular: 'Categoría', publicPath: '', fields: [title, { ...description, required: false }] },
  projects: { label: 'Proyectos', singular: 'Proyecto', publicPath: '/proyectos', fields: [title, description, body, image, imageAlt, category, url] },
  blog: { label: 'Blog', singular: 'Artículo', publicPath: '/blog', fields: [title, description, { ...body, required: true }, image, imageAlt, category] },
  company: { label: 'Empresa', singular: 'Perfil de empresa', publicPath: '/empresa', singleton: true, fields: [title, description, body, image, imageAlt, { key: 'email', label: 'Correo público', kind: 'email', max: 254 }, url] },
};

export function isResource(value: string): value is ResourceName {
  return Object.hasOwn(resourceDefinitions, value);
}

export type ResourceDocument = { published: boolean } & Record<string, string | boolean>;
export type ResourceRecord = { id: string; revision: number; document: ResourceDocument };

export function emptyResource(resource: ResourceName): ResourceDocument {
  return { ...Object.fromEntries(resourceDefinitions[resource].fields.map(field => [field.key, ''])), published: false };
}
