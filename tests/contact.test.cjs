const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const createLoader = require('./load-ts.cjs');

function setup() {
  const load = createLoader({ 'server-only': {} });
  return {
    load,
    ...load('src/content/contact.ts'),
    ...load('src/server/resourceValidation.ts'),
    ...load('src/content/adminResources.ts'),
  };
}

test('contact validation accepts empty settings and rejects injected protocols, booleans, phone numbers and fields', () => {
  const { validateResource, emptyResource } = setup();
  assert.deepEqual(validateResource('contact', emptyResource('contact')), emptyResource('contact'));
  for (const change of [
    { facebookUrl: 'javascript:alert(1)' }, { mapsUrl: 'http://maps.google.com' },
    { instagramUrl: 'https://user:secret@example.test' }, { xUrl: 'data:text/html,hello' },
    { facebookVisible: 'true' }, { published: 'true' }, { admin: true },
    { email: 'bad' }, { email: 'a@example.test\r\nBcc: x@example.test' },
    { phone: '1-----' }, { phone: '+1234567890123456' }, { phone: '1234567<script>' },
    { whatsapp: '0123456789' }, { whatsapp: '+521234567890' },
    { address: 'x'.repeat(501) }, { whatsappMessage: 'x'.repeat(501) },
  ]) {
    assert.throws(() => validateResource('contact', { published: true, ...change }));
  }
});

test('all social channels have verified react-icons and require both a URL and visibility', () => {
  const { socialNetworks, projectContact, validateResource } = setup();
  const doc = { published: true };
  for (const network of socialNetworks) {
    doc[`${network.key}Url`] = `https://example.test/${network.key}`;
    doc[`${network.key}Visible`] = true;
  }
  const contact = projectContact(validateResource('contact', doc));
  assert.deepEqual(contact.links.map(link => link.channel), socialNetworks.map(network => network.key));
  assert.deepEqual(projectContact({ ...doc, published: false }), { address: '', links: [] });
  assert.equal(projectContact({ ...doc, facebookUrl: '' }).links.length, socialNetworks.length - 1);
  assert.equal(projectContact({ ...doc, facebookVisible: false }).links.length, socialNetworks.length - 1);
  const { default: ContactIcon } = createLoader()('src/components/Contact/ContactIcon.tsx');
  for (const link of contact.links) {
    assert.match(renderToStaticMarkup(React.createElement(ContactIcon, { channel: link.channel })), /<svg/);
  }
});

test('phone and WhatsApp links normalize numbers and safely encode the initial message', () => {
  const { projectContact, validateResource } = setup();
  const result = projectContact(validateResource('contact', {
    published: true, phone: '+52 (55) 1234-5678', whatsapp: '525512345678',
    whatsappVisible: true, whatsappMessage: 'Hola & ¿me ayudas? #Ingenix',
  }));
  assert.equal(result.links[0].href, 'tel:+525512345678');
  assert.equal(result.links[1].href, `https://wa.me/525512345678?text=${encodeURIComponent('Hola & ¿me ayudas? #Ingenix')}`);
});

test('home composition hides empty contact and dangling CTAs, preserves design, order and the saved document', () => {
  const { load, composeHomeContact, projectContact } = setup();
  const { homePage } = load('src/content/home.ts');
  const source = structuredClone(homePage);
  const contactBlock = source.sections.find(section => section.id === 'contacto');
  contactBlock.navigationLabel = 'Contacto';
  contactBlock.content.note = 'Old placeholder';
  contactBlock.content.actions = [{ label: 'Old data', href: 'mailto:old@example.test', priority: 'primary' }];
  const empty = composeHomeContact(source, { address: '', links: [] });
  assert.equal(empty.sections.find(section => section.id === 'contacto').visible, false);
  assert.doesNotMatch(JSON.stringify(empty), /Old data|Old placeholder|old@example/);
  assert.equal(empty.sections[0].content.actions.some(action => action.href === '#contacto'), false);
  const filled = composeHomeContact(source, projectContact({ published: true, email: 'new@example.test' }));
  const section = filled.sections.find(section => section.id === 'contacto');
  assert.equal(section.visible, true);
  assert.equal(section.content.title, contactBlock.content.title);
  assert.equal(section.variant, contactBlock.variant);
  assert.deepEqual(filled.sections.map(item => item.id), source.sections.map(item => item.id));
  assert.equal(contactBlock.content.note, 'Old placeholder');
  contactBlock.visible = false;
  assert.equal(composeHomeContact(source, projectContact({ published: true, email: 'new@example.test' })).sections.find(item => item.id === 'contacto').visible, false);
});

test('contact links render no empty UI, use actual brand SVGs, escape data and protect external tabs', () => {
  const loader = createLoader();
  const icons = loader('src/components/Contact/ContactIcon.tsx');
  const { default: ContactLinks } = createLoader({ './ContactIcon': icons })('src/components/Contact/ContactLinks.tsx');
  assert.equal(renderToStaticMarkup(React.createElement(ContactLinks, { contact: { address: '', links: [] } })), '');
  const html = renderToStaticMarkup(React.createElement(ContactLinks, { contact: {
    address: '<script>literal</script>',
    links: [{ channel: 'instagram', label: 'Instagram', href: 'https://instagram.com/example' }],
  } }));
  assert.match(html, /<svg/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /noopener noreferrer/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script/);
});

test('global contact channels never become editable page actions or exceed the portable action schema', () => {
  const { load, projectContact, composeHomeContact, socialNetworks } = setup();
  const doc = { published: true, email: 'hello@example.test', phone: '+525512345678', whatsapp: '525512345678', whatsappVisible: true, mapsUrl: 'https://maps.google.com' };
  for (const network of socialNetworks) {
    doc[`${network.key}Url`] = `https://example.test/${network.key}`;
    doc[`${network.key}Visible`] = true;
  }
  const { homePage } = load('src/content/home.ts');
  const contact = projectContact(doc);
  assert.equal(contact.links.length, 11);
  const composed = composeHomeContact(homePage, contact);
  const { validatePageDocument } = load('src/page-builder/schemas/page.schema.ts');
  assert.equal(validatePageDocument(composed, { mode: 'publish' }).success, true);
  const section = composed.sections.find(item => item.id === 'contacto');
  assert.deepEqual(section.content.actions, []);
  const { inlineTextFields, updateInlineText } = load('src/components/PageBuilder/inlineEditing.ts');
  assert.equal(inlineTextFields(section).some(field => field.path === 'content.title'), true);
  assert.equal(inlineTextFields(section).some(field => field.path === 'content.note' || field.path.startsWith('content.actions.')), false);
  assert.deepEqual(updateInlineText(section, 'content.note', 'Duplicated contact'), section);
});
