const { test } = require('node:test');
const assert = require('node:assert/strict');
const createLoader = require('./load-ts.cjs');

function record(id, published = true, fields = {}) {
  return {
    id,
    revision: 1,
    document: { title: id, description: `Descripción de ${id}`, published, ...fields },
  };
}

test('home replaces static catalogue cards, excludes drafts and preserves layout without mutation', () => {
  const load = createLoader();
  const { homePage } = load('src/content/home.ts');
  const { composeHomeCatalogs } = load('src/content/homeCatalogs.ts');
  const before = structuredClone(homePage);
  const services = [record('web', true, { image: '/img/web_site_1.jpg', imageAlt: 'Sitio web' }), record('draft', false)];
  const projects = [record('plataforma'), record('hidden', false)];
  const result = composeHomeCatalogs(homePage, services, projects);
  const serviceSection = result.sections.find(section => section.id === 'servicios');
  const projectSection = result.sections.find(section => section.id === 'proyectos');

  assert.deepEqual(homePage, before);
  assert.equal(result.sections.length, homePage.sections.length);
  assert.equal(serviceSection.variant, 'image-top');
  assert.equal(serviceSection.columns, 3);
  assert.equal(serviceSection.content.title, before.sections.find(section => section.id === 'servicios').content.title);
  assert.deepEqual(serviceSection.content.items.map(item => item.id), ['web']);
  assert.deepEqual(serviceSection.content.items[0].image, { src: '/img/web_site_1.jpg', alt: 'Sitio web' });
  assert.equal(serviceSection.content.items[0].link.href, '/servicios/web');
  assert.deepEqual(projectSection.content.items.map(item => item.id), ['plataforma']);
  assert.equal(projectSection.content.items[0].link.href, '/proyectos/plataforma');
  assert.equal(projectSection.content.items[0].image.src, '');
  assert.equal(projectSection.content.items[0].logo, undefined);
  assert.deepEqual(result.sections.find(section => section.id === 'experiencia'), before.sections.find(section => section.id === 'experiencia'));
});

test('removing or unpublishing records never restores static or demo cards', () => {
  const load = createLoader();
  const { homePage } = load('src/content/home.ts');
  const { composeHomeCatalogs } = load('src/content/homeCatalogs.ts');
  const result = composeHomeCatalogs(homePage, [], [record('unpublished', false)]);
  assert.deepEqual(result.sections.find(section => section.id === 'servicios').content.items, []);
  assert.deepEqual(result.sections.find(section => section.id === 'proyectos').content.items, []);
});

test('catalogue connection respects hidden, renamed, removed and unrelated builder sections', () => {
  const load = createLoader();
  const { homePage } = load('src/content/home.ts');
  const { composeHomeCatalogs } = load('src/content/homeCatalogs.ts');
  const page = structuredClone(homePage);
  page.sections = page.sections.filter(section => section.id !== 'proyectos');
  page.sections.find(section => section.id === 'servicios').visible = false;
  const custom = structuredClone(page.sections.find(section => section.id === 'servicios'));
  custom.id = 'otras-tarjetas';
  page.sections.push(custom);
  const result = composeHomeCatalogs(page, [record('live')], [record('project')]);
  assert.equal(result.sections.find(section => section.id === 'servicios').visible, false);
  assert.equal(result.sections.some(section => section.id === 'proyectos'), false);
  assert.deepEqual(result.sections.find(section => section.id === 'otras-tarjetas'), custom);
});

test('server composes published home or template using only the public catalogue readers', async () => {
  let published = null;
  let services = [record('live')];
  const reads = [];
  const load = createLoader({
    'server-only': {},
    react: { cache: fn => fn },
    './publishedHome': { getPublishedHome: async () => published },
    './publicContent': { getPublicList: async section => {
      reads.push(section);
      return { records: section === 'servicios' ? services : [], next: null };
    } },
  });
  const { getHomeContent } = load('src/server/homeContent.ts');
  const { homePage } = load('src/content/home.ts');
  let result = await getHomeContent();
  assert.equal(result.sections.find(section => section.id === 'servicios').content.items[0].id, 'live');
  published = { ...structuredClone(homePage), title: 'Inicio publicado' };
  services = [record('updated', true, { description: 'Modificado desde el admin' })];
  result = await getHomeContent();
  assert.equal(result.title, 'Inicio publicado');
  assert.equal(result.sections.find(section => section.id === 'servicios').content.items[0].description, 'Modificado desde el admin');
  services = [];
  result = await getHomeContent();
  assert.deepEqual(result.sections.find(section => section.id === 'servicios').content.items, []);
  assert.deepEqual(reads, ['servicios', 'proyectos', 'servicios', 'proyectos', 'servicios', 'proyectos']);
});
