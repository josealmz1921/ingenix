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
  assert.equal(projectSection.content.items[0].image, undefined);
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
    './publicContent': { getPublishedCatalog: async section => {
      reads.push(section);
      return section === 'services' ? services : [];
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
  assert.deepEqual(reads, ['services', 'projects', 'services', 'projects', 'services', 'projects']);
});

test('manual selection preserves editorial order, works beyond first 25 records, and skips unavailable entries', () => {
  const load = createLoader();
  const { homePage } = load('src/content/home.ts');
  const { composeHomeCatalogs, normalizeHomeCatalogs } = load('src/content/homeCatalogs.ts');
  const page = normalizeHomeCatalogs(structuredClone(homePage));
  const section = page.sections.find(item => item.id === 'servicios');
  section.id = 'seleccion-destacada';
  section.catalog = { mode: 'selected', items: [{ recordId: 'service-29' }, { recordId: 'missing' }, { recordId: 'service-2' }, { recordId: 'draft' }] };
  const services = Array.from({ length: 35 }, (_, index) => record(`service-${index}`));
  services.push(record('draft', false));
  const result = composeHomeCatalogs(page, services, []);
  assert.deepEqual(result.sections.find(item => item.id === section.id).content.items.map(item => item.id), ['service-29', 'service-2']);
  assert.deepEqual(section.content.items, []);
  section.catalog.items = [];
  assert.deepEqual(composeHomeCatalogs(page, services, []).sections.find(item => item.id === section.id).content.items, []);
});

test('explicit local mode retains generic cards and overrides legacy auto-connection', () => {
  const load = createLoader();
  const { homePage } = load('src/content/home.ts');
  const { composeHomeCatalogs } = load('src/content/homeCatalogs.ts');
  const page = structuredClone(homePage);
  const section = page.sections.find(item => item.id === 'servicios');
  section.catalog = { mode: 'static', items: [] };
  assert.deepEqual(composeHomeCatalogs(page, [record('new')], []).sections.find(item => item.id === 'servicios'), section);
});

test('connected drafts store references only; normalization is idempotent and preserves source records', () => {
  const load = createLoader({ 'server-only': {}, './adminApi': { ApiError: class extends Error {} } });
  const { homePage } = load('src/content/home.ts');
  const { normalizeHomeCatalogs, composeHomeCatalogs } = load('src/content/homeCatalogs.ts');
  const { validateStoredPage } = load('src/server/pages.ts');
  const page = { ...structuredClone(homePage), id: 'home' };
  const normalized = normalizeHomeCatalogs(page);
  const services = normalized.sections.find(item => item.id === 'servicios');
  assert.deepEqual(services.catalog, { mode: 'all', items: [] });
  assert.deepEqual(services.content.items, []);
  assert.ok(page.sections.find(item => item.id === 'servicios').content.items.length > 0);
  const hydrated = composeHomeCatalogs(normalized, [record('web')], []);
  const stored = validateStoredPage(hydrated, 'draft');
  assert.deepEqual(stored.sections.find(item => item.id === 'servicios').content.items, []);
  assert.deepEqual(normalizeHomeCatalogs(normalized), normalized);
});

test('catalogue references reject duplicates, traversal, unknown fields and cross-resource overrides', () => {
  const load = createLoader();
  const { initialPage } = load('src/components/PageBuilder/initialPage.ts');
  const { validatePageDocument } = load('src/page-builder/schemas/page.schema.ts');
  const valid = initialPage();
  valid.sections.find(item => item.id === 'servicios').catalog = { mode: 'selected', items: [{ recordId: 'valid-id' }] };
  assert.equal(validatePageDocument(valid).success, true);
  for (const alter of [
    catalog => { catalog.mode = 'arbitrary'; },
    catalog => { catalog.resource = 'users'; },
    catalog => { catalog.items.push({ recordId: 'valid-id' }); },
    catalog => { catalog.items[0].recordId = '../secret'; },
    catalog => { catalog.items[0].recordId = 'new'; },
    catalog => { catalog.items[0].recordId = 'x'.repeat(101); },
    catalog => { catalog.items = Array.from({ length: 101 }, (_, i) => ({ recordId: `record-${i}` })); },
  ]) {
    const page = structuredClone(valid);
    alter(page.sections.find(item => item.id === 'servicios').catalog);
    assert.equal(validatePageDocument(page).success, false);
  }
});

test('catalogue picker endpoint authorizes before reading and never returns drafts', async () => {
  let authorized = false;
  let reads = 0;
  const load = createLoader({
    'server-only': {},
    './adminApi': {
      requireAdmin: async () => { if (!authorized) throw new Error('denied'); },
      apiResponse: value => Response.json(value, { headers: { 'cache-control': 'no-store' } }),
      apiError: () => Response.json({ error: 'denied' }, { status: 401 }),
    },
    './publicContent': { getPublishedCatalog: async () => { reads++; return [record('public')]; } },
  });
  const { getPageCatalogs } = load('src/server/pageCatalogs.ts');
  assert.equal((await getPageCatalogs(new Request('http://localhost'))).status, 401);
  assert.equal(reads, 0);
  authorized = true;
  const response = await getPageCatalogs(new Request('http://localhost'));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(reads, 2);
  const result = await response.json();
  assert.equal(result.services[0].document.published, true);
});

test('catalogue item text is never exposed as inline-editable page content', () => {
  const load = createLoader();
  const { initialPage } = load('src/components/PageBuilder/initialPage.ts');
  const { composeHomeCatalogs } = load('src/content/homeCatalogs.ts');
  const { inlineTextFields, updateInlineText } = load('src/components/PageBuilder/inlineEditing.ts');
  const section = composeHomeCatalogs(initialPage(), [record('web')], []).sections.find(item => item.id === 'servicios');
  assert.equal(inlineTextFields(section).some(field => field.path.startsWith('content.items.')), false);
  assert.equal(inlineTextFields(section).some(field => field.path === 'content.title'), true);
  assert.deepEqual(updateInlineText(section, 'content.items.0.title', 'Duplicated text'), section);
});
