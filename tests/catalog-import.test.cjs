const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const createLoader = require('./load-ts.cjs');

function setup() {
  const records = new Map();
  const writes = [];
  let transactions = 0;
  const getAll = async (...refs) => refs.map(ref => ({ exists: records.has(ref.path) }));
  const db = {
    collection: name => ({ doc: id => ({ path: `${name}/${id}` }) }),
    getAll,
    runTransaction: async callback => {
      transactions++;
      const pending = [];
      const result = await callback({
        getAll,
        create: (ref, value) => {
          assert.equal(records.has(ref.path), false);
          pending.push([ref.path, value]);
        },
      });
      pending.forEach(([path, value]) => {
        records.set(path, value);
        writes.push(path);
      });
      return result;
    },
  };
  const load = createLoader({
    'server-only': {},
    'firebase-admin/firestore': { FieldValue: { serverTimestamp: () => 'server-time' } },
    './adminApi': { ApiError: class extends Error {} },
  });
  const { prepareCatalogImport } = load('src/content/catalogImport.ts');
  const { homeSections } = load('src/content/home.ts');
  const { importCatalogEntries } = load('src/server/catalogImport.ts');
  return { records, writes, db, load, homeSections, entries: prepareCatalogImport(homeSections), importCatalogEntries, transactions: () => transactions };
}

test('migration preserves original content and media, with demos private by default', () => {
  const { entries, homeSections, load } = setup();
  assert.equal(entries.length, 10);
  assert.equal(entries.filter(entry => entry.resource === 'services' && entry.document.published).length, 6);
  assert.deepEqual(entries.filter(entry => entry.resource === 'projects' && entry.document.published).map(entry => entry.id), ['kaband', 'bientasty']);
  assert.deepEqual(entries.filter(entry => !entry.document.published).map(entry => entry.id), ['demo-plataforma-operativa', 'demo-aplicacion-movil']);
  const { validateResource } = load('src/server/resourceValidation.ts');
  for (const entry of entries) {
    const original = homeSections.find(section => section.id === (entry.resource === 'services' ? 'servicios' : 'proyectos')).content.items.find(item => item.id === entry.id);
    assert.equal(entry.document.title, original.title);
    assert.equal(entry.document.description, original.description);
    assert.equal(entry.document.image, original.image.src);
    assert.equal(entry.document.url, original.link?.href || '');
    assert.doesNotThrow(() => validateResource(entry.resource, entry.document));
    assert.ok(fs.existsSync(`public${entry.document.image}`));
    if (entry.resource === 'projects') {
      assert.equal(entry.document.company, original.company);
      assert.equal(entry.document.logo, original.logo.src);
      assert.equal(entry.document.categoryLabel, original.category);
      assert.ok(fs.existsSync(`public${entry.document.logo}`));
    }
  }
});

test('dry run writes nothing; applying creates only missing records and is idempotent', async () => {
  const fixture = setup();
  const { db, records, writes, entries, importCatalogEntries } = fixture;
  const existing = { revision: 7, document: { title: 'Edición del administrador', published: false } };
  records.set('cms_services/web', structuredClone(existing));
  const dry = await importCatalogEntries(db, entries);
  assert.equal(dry.filter(entry => entry.skipped).length, 1);
  assert.equal(writes.length, 0);
  assert.equal(fixture.transactions(), 0);
  const imported = await importCatalogEntries(db, entries, true);
  assert.equal(imported.filter(entry => !entry.skipped).length, 9);
  assert.equal(writes.length, 9);
  assert.deepEqual(records.get('cms_services/web'), existing);
  assert.equal(records.get('cms_projects/kaband').revision, 1);
  assert.equal(records.get('cms_projects/demo-aplicacion-movil').document.published, false);
  const repeated = await importCatalogEntries(db, entries, true);
  assert.equal(repeated.every(entry => entry.skipped), true);
  assert.equal(writes.length, 9);
  assert.deepEqual(records.get('cms_services/web'), existing);
});

test('invalid records, media, logos and duplicate IDs fail before any writes', async () => {
  const { db, entries, writes, importCatalogEntries } = setup();
  for (const alter of [
    entry => { entry.id = '../unsafe'; },
    entry => { entry.resource = 'company'; },
    entry => { entry.document.image = 'https://evil.test/image.png'; },
    entry => { entry.document.logo = '/img/logo_kaband.png'; entry.document.logoAlt = ''; },
  ]) {
    const invalid = structuredClone(entries.find(entry => entry.resource === 'projects'));
    alter(invalid);
    await assert.rejects(importCatalogEntries(db, [invalid], true));
  }
  await assert.rejects(importCatalogEntries(db, [entries[0], entries[0]], true));
  assert.equal(writes.length, 0);
});

test('imported project branding reaches home cards while demo projects stay excluded', () => {
  const { entries, load } = setup();
  const { homePage } = load('src/content/home.ts');
  const { composeHomeCatalogs } = load('src/content/homeCatalogs.ts');
  const records = entries.map(entry => ({ id: entry.id, document: entry.document, revision: 1 }));
  const result = composeHomeCatalogs(homePage, records.slice(0, 6), records.slice(6));
  const projects = result.sections.find(section => section.id === 'proyectos').content.items;
  assert.equal(projects.length, 2);
  assert.equal(projects[0].company, 'Grupo Kaband');
  assert.equal(projects[0].logo.src, '/img/logo_kaband.png');
  assert.equal(projects[0].category, 'Aplicación web · Administración');
});
