const { test } = require('node:test');
const assert = require('node:assert/strict');
const createLoader = require('./load-ts.cjs');

function setup() {
  const store = new Map();
  let reads = 0;
  let writes = 0;
  let dbCalls = 0;
  const snapshot = path => ({ id: path.split('/').at(-1), exists: store.has(path), data: () => structuredClone(store.get(path)) });
  const doc = path => ({ path, get: async () => { reads++; return snapshot(path); } });
  const collection = name => {
    let filter = false;
    let cursor = '';
    let limit = 50;
    const query = {
      doc: id => doc(`${name}/${id}`),
      orderBy: () => query,
      where: (field, operator, value) => { assert.equal(field, 'document.published'); assert.equal(value, true); filter = true; return query; },
      limit: size => { limit = size; return query; },
      startAfter: value => { cursor = value; return query; },
      get: async () => {
        reads++;
        const docs = [...store.keys()].filter(path => path.startsWith(`${name}/`) && path.split('/')[1] > cursor)
          .filter(path => !filter || store.get(path).document.published).sort().slice(0, limit).map(snapshot);
        return { docs, size: docs.length };
      },
    };
    return query;
  };
  const db = {
    collection,
    runTransaction: async callback => {
      const actions = [];
      const result = await callback({
        get: async ref => { reads++; return snapshot(ref.path); },
        set: (ref, data) => actions.push(() => { store.set(ref.path, structuredClone(data)); writes++; }),
        delete: ref => actions.push(() => { store.delete(ref.path); writes++; }),
      });
      actions.forEach(action => action());
      return result;
    },
  };
  const load = createLoader({
    'server-only': {},
    react: { cache: fn => fn },
    './firebaseAdmin': {
      adminAuth: () => ({ verifyIdToken: async (token, revoked) => {
        assert.equal(revoked, true);
        if (token === 'revoked') throw new Error('Invalid');
        return { uid: 'fictional-user', admin: token === 'admin' ? true : token === 'string' ? 'true' : false };
      } }),
      adminDb: () => { dbCalls++; return db; },
    },
    'firebase-admin/firestore': { FieldValue: { serverTimestamp: () => 'server-time' } },
  });
  return { load, api: load('src/server/resources.ts'), store, counters: () => ({ reads, writes, dbCalls }) };
}

const document = (published = false) => ({ title: 'Ingenix', description: 'Software a medida', body: 'Contenido', published });
function request(body, token = 'admin', method = 'PUT') {
  return new Request('https://example.test/api/admin/content/services', {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(method !== 'GET' ? { body: JSON.stringify(body) } : {}),
  });
}

test('all resource operations authorize before database access', async () => {
  for (const token of ['', 'user', 'string', 'revoked']) {
    const { api, counters } = setup();
    for (const operation of [
      () => api.readResources(request(null, token, 'GET'), 'services'),
      () => api.readResources(request(null, token, 'GET'), 'blog', 'article'),
      () => api.writeResource(request({ revision: 0, document: document() }, token), 'projects', 'demo'),
      () => api.writeResource(request({ revision: 1 }, token, 'DELETE'), 'company', 'profile', true),
    ]) assert.equal((await operation()).status, !token || token === 'revoked' ? 401 : 403);
    assert.deepEqual(counters(), { reads: 0, writes: 0, dbCalls: 0 });
  }
});

test('resource save, stale revision, read, publication and delete', async () => {
  const { api, store } = setup();
  let response = await api.writeResource(request({ document: document(), revision: 0 }), 'services', 'web');
  assert.equal(response.status, 200);
  assert.equal(store.get('cms_services/web').revision, 1);
  assert.equal(store.get('cms_services/web').document.published, false);
  assert.equal((await api.writeResource(request({ document: document(), revision: 0 }), 'services', 'web')).status, 409);
  response = await api.readResources(request(null, 'admin', 'GET'), 'services', 'web');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal((await response.json()).document.title, 'Ingenix');
  assert.equal((await api.writeResource(request({ document: document(true), revision: 1 }), 'services', 'web')).status, 200);
  assert.equal((await api.writeResource(request({ revision: 1 }), 'services', 'web', true)).status, 409);
  assert.equal((await api.writeResource(request({ revision: 2 }), 'services', 'web', true)).status, 200);
  assert.equal(store.has('cms_services/web'), false);
});

test('schema rejects arbitrary collections, fields, IDs, URLs, images and oversized input', async () => {
  const { api, counters } = setup();
  assert.equal((await api.writeResource(request({ document: document(), revision: 0 }), 'users', 'admin')).status, 404);
  for (const id of ['../home', 'foo/bar', '__proto__', 'UPPER', 'new']) {
    assert.equal((await api.writeResource(request({ document: document(), revision: 0 }), 'services', id)).status, 400);
  }
  assert.equal((await api.writeResource(request({ document: document(), revision: 0 }), 'company', 'other')).status, 400);
  for (const change of [
    { admin: true }, { published: 'true' }, { title: '' }, { title: 'a'.repeat(161) },
    { url: 'javascript:alert(1)' }, { url: 'https://user:password@example.test' },
    { image: 'https://evil.test/image.jpg', imageAlt: 'Imagen' }, { image: '/img/valid.jpg' },
  ]) assert.equal((await api.writeResource(request({ document: { ...document(), ...change }, revision: 0 }), 'services', 'web')).status, 400);
  assert.equal((await api.writeResource(request({ document: { ...document(), body: 'x'.repeat(140000) }, revision: 0 }), 'services', 'web')).status, 413);
  assert.equal(counters().writes, 0);
});

test('categories must exist, and published resources require published categories', async () => {
  const { api, store } = setup();
  const content = { ...document(true), categoryId: 'software' };
  const save = () => api.writeResource(request({ document: content, revision: 0 }), 'services', 'web');
  assert.equal((await save()).status, 400);
  store.set('cms_categories/software', { document: { title: 'Software', published: false }, revision: 1 });
  assert.equal((await save()).status, 400);
  store.get('cms_categories/software').document.published = true;
  assert.equal((await save()).status, 200);
});

test('public readers return only valid published projections; unpublished direct URLs remain private', async t => {
  const original = process.env.FIREBASE_ADMIN_PROJECT_ID;
  process.env.FIREBASE_ADMIN_PROJECT_ID = 'demo-ingenix-security';
  t.after(() => { if (original === undefined) delete process.env.FIREBASE_ADMIN_PROJECT_ID; else process.env.FIREBASE_ADMIN_PROJECT_ID = original; });
  const { load, store } = setup();
  const api = load('src/server/publicContent.ts');
  store.set('cms_services/draft', { document: document(), revision: 1 });
  store.set('cms_services/live', { document: document(true), revision: 3, updatedBy: 'PRIVATE' });
  store.set('cms_services/invalid', { document: { ...document(true), admin: true }, revision: 1 });
  const page = await api.getPublicList('servicios');
  assert.deepEqual(page.records.map(record => record.id), ['live']);
  assert.doesNotMatch(JSON.stringify(page), /PRIVATE|updatedBy/);
  assert.equal(await api.getPublicRecord('servicios', 'draft'), null);
  assert.equal(await api.getPublicRecord('servicios', '../draft'), null);
  assert.equal((await api.getPublicRecord('servicios', 'live')).document.title, 'Ingenix');
});

test('public articles render stored markup as literal text, never executable HTML', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const load = createLoader({ 'next/image': { __esModule: true, default: props => React.createElement('img', props) } });
  const { default: ContentArticle } = load('src/components/PublicContent/ContentArticle.tsx');
  const html = renderToStaticMarkup(React.createElement(ContentArticle, {
    record: { id: 'safe', revision: 0, document: { ...document(true), body: '<script>alert("literal")</script>' } },
  }));
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script/);
});
