const { test, before, after } = require('node:test');
const fs = require('node:fs');
const { initializeTestEnvironment, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc } = require('firebase/firestore');

let environment;
before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Ejecuta en el emulador, nunca contra producción.');
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
  environment = await initializeTestEnvironment({ projectId: 'demo-ingenix-security', firestore: { host, port: Number(port), rules: fs.readFileSync('firestore.rules', 'utf8') } });
});
after(async () => { await environment?.cleanup(); });

for (const role of ['anonymous', 'user', 'admin']) {
  test(`Firestore denies direct CMS access for ${role}; APIs own authorization`, async () => {
    const context = role === 'anonymous' ? environment.unauthenticatedContext() : environment.authenticatedContext(`test-${role}`, { admin: role === 'admin' });
    for (const path of ['pageDrafts/home', 'pagePublished/home', 'cms_services/web', 'cms_blog/article', 'cms_company/profile', 'private/data']) {
      const ref = doc(context.firestore(), path);
      await assertFails(getDoc(ref));
      await assertFails(setDoc(ref, { document: { title: 'Demo', published: true } }));
    }
  });
}
