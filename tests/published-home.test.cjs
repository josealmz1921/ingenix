const { test } = require('node:test');
const assert = require('node:assert/strict');
const createLoader = require('./load-ts.cjs');

test('Ingenix template preserves the homepage structure with catalogue references instead of duplicate cards', () => {
  const load = createLoader();
  const { initialPage } = load('src/components/PageBuilder/initialPage.ts');
  const { homePage } = load('src/content/home.ts');
  const { validatePageDocument } = load('src/page-builder/schemas/page.schema.ts');
  const { pageHomeErrors } = load('src/utilities/pageBuilder.ts');
  const page = initialPage();
  assert.equal(page.id, 'home');
  const { normalizeHomeCatalogs } = load('src/content/homeCatalogs.ts');
  assert.deepEqual(page.sections, normalizeHomeCatalogs(homePage).sections);
  assert.deepEqual(pageHomeErrors(page), []);
  assert.equal(validatePageDocument(page, { mode: 'publish' }).success, true);
  page.sections[0].content.title = 'Local';
  assert.notEqual(initialPage().sections[0].content.title, 'Local');
});

test('public home only reads publication and falls back for invalid publication or rollback', async t => {
  const environment = { ...process.env };
  Object.assign(process.env, { FIREBASE_ADMIN_PROJECT_ID: 'demo-ingenix-security', PAGE_BUILDER_HOME_DISABLED: 'false' });
  t.after(() => { process.env = environment; });
  const reads = [];
  let stored;
  const load = createLoader({
    'server-only': {}, react: { cache: fn => fn },
    './firebaseAdmin': { adminDb: () => ({ doc: path => ({ get: async () => { reads.push(path); return { exists: Boolean(stored), data: () => stored }; } }) }) },
  });
  const { getPublishedHome } = load('src/server/publishedHome.ts');
  assert.equal(await getPublishedHome(), null);
  const { initialPage } = load('src/components/PageBuilder/initialPage.ts');
  stored = { document: initialPage(), revision: 1 };
  assert.equal((await getPublishedHome()).id, 'home');
  stored.document.sections[0].content.image.src = 'https://evil.test/image.png';
  assert.equal(await getPublishedHome(), null);
  process.env.PAGE_BUILDER_HOME_DISABLED = 'true';
  assert.equal(await getPublishedHome(), null);
  assert.deepEqual(reads, Array(3).fill('pagePublished/home'));
});
