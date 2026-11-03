import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Compile local TS in memory; no generated files, new runner or global require hooks.
const require = createRequire(import.meta.url);
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (file.endsWith('.css')) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
  if (cache.has(file)) return cache.get(file).exports;
  const source = fs.readFileSync(file, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  const compiledModule = { exports: {} };
  cache.set(file, compiledModule);
  const localRequire = (name) => {
    if (!name.startsWith('.')) return require(name);
    const target = path.resolve(path.dirname(file), name);
    const resolved = [target, `${target}.ts`, `${target}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (!resolved) throw new Error(`Cannot resolve ${name}`);
    return load(resolved);
  };
  new vm.Script(`(function(module, exports, require) { ${compiled}\n})`, { filename: file })
    .runInThisContext()(compiledModule, compiledModule.exports, localRequire);
  return compiledModule.exports;
}

const { examplePage } = load('src/page-builder/examples/page.ts');
const { validatePageDocument, parsePageDocument, isSafeUrl } = load('src/page-builder/schemas/page.schema.ts');
const { createBlock } = load('src/page-builder/registry/create-block.ts');
const { blockRegistry } = load('src/page-builder/registry/blocks.ts');
const { getBlockFields } = load('src/page-builder/registry/fields.ts');
const { default: PageRenderer } = load('src/page-builder/renderer/PageRenderer.tsx');
const { florDeLunaTheme } = load('src/page-builder/styles/themes.ts');
const copy = () => structuredClone(examplePage);

test('valid page round-trips as JSON and parsing omits undefined properties', () => {
  const page = copy(); page.sections[0].navigationLabel = undefined;
  const parsed = parsePageDocument(page);
  assert.deepEqual(JSON.parse(JSON.stringify(parsed)), parsed);
  assert.equal('navigationLabel' in parsed.sections[0], false);
});

test('unknown fields, versions, blocks and variants are rejected', () => {
  const changes = [
    (p) => { p.schemaVersion = 2; },
    (p) => { p.sections[0].type = '__proto__'; },
    (p) => { p.sections[1].variant = 'missing'; },
    (p) => { p.sections[0].content.html = '<script>alert(1)</script>'; },
    (p) => { p.sections[0].settings = { imageOpacity: 2 }; },
    (p) => { p.sections[1].columns = 9; },
  ];
  for (const change of changes) { const p = copy(); change(p); assert.equal(validatePageDocument(p).success, false); }
});

test('safe URLs allow local, HTTP(S), anchor, email and phone but reject executable URLs', () => {
  for (const url of ['/servicios', 'https://example.com', '#contacto', 'mailto:demo@example.com', 'tel:+521234567890']) assert.equal(isSafeUrl(url), true, url);
  for (const url of ['javascript:alert(1)', 'data:image/svg+xml,test', '//example.com', '/\\evil.com', 'https://user:password@example.com', 'mailto:test@example.com%0aBcc:bad@example.com']) assert.equal(isSafeUrl(url), false, url);
  assert.equal(isSafeUrl('mailto:demo@example.com', true), false);
  const p = copy(); p.sections[0].content.actions = [{ label: 'Ir', href: 'javascript:alert(1)' }];
  assert.equal(validatePageDocument(p).success, false);
});

test('publish requires a unique first H1; drafts may be empty', () => {
  const p = copy(); p.sections = [];
  assert.equal(validatePageDocument(p).success, false);
  assert.equal(validatePageDocument(p, { mode: 'draft' }).success, true);
  const duplicate = copy(); duplicate.sections.push({ ...duplicate.sections[0], id: 'otra-portada' });
  assert.equal(validatePageDocument(duplicate).success, false);
  const reordered = copy(); reordered.sections.reverse();
  assert.equal(validatePageDocument(reordered).success, false);
});

test('duplicate IDs, reserved anchors, oversized lists and incomplete items are rejected', () => {
  const changes = [
    (p) => { p.sections[1].id = p.sections[0].id; },
    (p) => { p.sections[1].id = 'contenido'; },
    (p) => { p.sections[1].content.items.push(p.sections[1].content.items[0]); },
    (p) => { p.sections[1].content.items[0].image = { src: '/picture.jpg' }; },
    (p) => { p.sections = Array(101).fill(p.sections[0]); },
  ];
  for (const change of changes) { const p = copy(); change(p); assert.equal(validatePageDocument(p).success, false); }
});

test('every block has editor fields and a valid draft factory', () => {
  for (const type of Object.keys(blockRegistry)) {
    const block = createBlock(type, `nuevo-${type}`);
    assert.deepEqual(getBlockFields(type).find((field) => field.name === 'variant').options, blockRegistry[type].variants);
    assert.equal(validatePageDocument({ ...copy(), sections: [block] }, { mode: 'draft' }).success, true, type);
  }
});

test('all variants render; hidden blocks disappear; content remains escaped', () => {
  for (const [type, config] of Object.entries(blockRegistry)) {
    for (const variant of config.variants) {
      const block = createBlock(type, `bloque-${type}`);
      block.variant = variant;
      block.content.description = 'Descripción de ejemplo';
      if (type === 'hero' || type === 'banner') block.content.image = { src: '/background.jpg', alt: '' };
      if (type === 'cards' || type === 'carousel') block.content.items = [{ id: 'tarjeta', title: 'Tarjeta', description: 'Contenido', image: { src: '/card.jpg', alt: 'Imagen' } }];
      if (type === 'progress') block.content.items = [{ id: 'indicador', title: 'Avance', value: 40, max: 100 }];
      if (type === 'projects') {
        block.content.emptyMessage = 'Sin proyectos';
        block.content.items = [{ id: 'proyecto', title: 'Proyecto', description: 'Descripción', category: 'Web', company: 'Empresa', image: { src: '/demo.jpg', alt: 'Captura' }, logo: { src: '/logo.png', alt: 'Logo' }, link: { text: 'Visitar', href: 'https://example.com', target: '_blank' } }];
      }
      const sections = type === 'hero' ? [block] : [copy().sections[0], block];
      const html = renderToStaticMarkup(React.createElement(PageRenderer, { document: { ...copy(), sections } }));
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
      assert.ok(html.includes(`id="bloque-${type}"`), `${type}/${variant}`);
    }
  }
  const p = copy(); p.sections[1].visible = false; p.sections[0].content.title = '<script>alert(1)</script>';
  const html = renderToStaticMarkup(React.createElement(PageRenderer, { document: p, theme: florDeLunaTheme }));
  assert.ok(!html.includes('id="servicios"'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('--pb-background:var(--color-secondary, #f5f2ed)'));
});

test('portable module has no external aliases, brand content, env or Tailwind directives', () => {
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (/\.(tsx?|css)$/.test(target)) {
        const text = fs.readFileSync(target, 'utf8');
        assert.ok(!/@apply|@\/|process\.env|Ingenix|\/img\//.test(text), target);
      }
    }
  }
  walk('src/page-builder');
});

test('carousel validates slides, columns, limits and safe URLs without requiring a slider dependency', () => {
  const block = createBlock('carousel', 'galeria');
  block.content.description = 'Una galería reutilizable';
  const page = { ...copy(), sections: [copy().sections[0], block] };
  assert.equal(validatePageDocument(page, { mode: 'draft' }).success, true);
  assert.equal(validatePageDocument(page).success, false, 'an empty carousel cannot publish');
  block.content.items = [
    { id: 'primera', title: '<script>test</script>', description: 'Primera diapositiva', link: { text: 'Ver más', href: '/detalle' } },
    { id: 'segunda', title: 'Segunda', description: 'Segunda diapositiva' },
  ];
  assert.equal(validatePageDocument(page).success, true);
  const html = renderToStaticMarkup(React.createElement(PageRenderer, { document: page }));
  assert.ok(html.includes('&lt;script&gt;test&lt;/script&gt;'));
  assert.ok(html.includes('aria-label="Siguiente: Carrusel"'));
  assert.ok(html.includes('aria-controls='));
  assert.ok(html.includes('href="/detalle"'));
  assert.ok(html.includes('tabindex="0"'));
  for (const change of [
    p => { p.sections[1].columns = 5; },
    p => { p.sections[1].content.items[0].link.href = 'javascript:alert(1)'; },
    p => { p.sections[1].content.items[0].image = { src: 'data:image/svg+xml,test', alt: '' }; },
    p => { p.sections[1].content.items = Array.from({ length: 31 }, (_, i) => ({ id: `slide-${i}`, title: 'Slide', description: '' })); },
  ]) {
    const invalid = structuredClone(page);
    change(invalid);
    assert.equal(validatePageDocument(invalid).success, false);
  }
});

test('progress validates numeric ranges and emits labelled accessible indicators', () => {
  const block = createBlock('progress', 'avance');
  block.content.description = 'Indicadores configurables';
  const page = { ...copy(), sections: [copy().sections[0], block] };
  assert.equal(validatePageDocument(page, { mode: 'draft' }).success, true);
  assert.equal(validatePageDocument(page).success, false);
  block.content.items = [{ id: 'implementacion', title: 'Implementación', value: 35, max: 50 }];
  assert.equal(validatePageDocument(page).success, true);
  const html = renderToStaticMarkup(React.createElement(PageRenderer, { document: page }));
  assert.ok(html.includes('role="progressbar"'));
  assert.ok(html.includes('aria-label="Implementación"'));
  assert.ok(html.includes('aria-valuenow="35"'));
  assert.ok(html.includes('aria-valuemax="50"'));
  assert.ok(html.includes('width:70%'));
  for (const [key, value] of [['value', -1], ['value', 51], ['value', '35'], ['value', NaN], ['max', 0], ['max', Infinity], ['max', 1000001]]) {
    const invalid = structuredClone(page);
    invalid.sections[1].content.items[0][key] = value;
    assert.equal(validatePageDocument(invalid).success, false, `${key}: ${value}`);
  }
  const duplicate = structuredClone(page);
  duplicate.sections[1].content.items.push(duplicate.sections[1].content.items[0]);
  assert.equal(validatePageDocument(duplicate).success, false);
});

test('reusable progress clamps invalid runtime values without NaN, Infinity or inaccessible ARIA ranges', () => {
  const { default: Progress } = load('src/page-builder/components/ui/Progress/Progress.tsx');
  for (const props of [{ value: Infinity, max: 0 }, { value: -10, max: -1 }, { value: 200, max: 100 }]) {
    const html = renderToStaticMarkup(React.createElement(Progress, props));
    assert.ok(!/NaN|Infinity|width:-/.test(html));
    assert.ok(html.includes('aria-valuemax="100"'));
    assert.ok(html.includes(`aria-valuenow="${props.value === 200 ? 100 : 0}"`));
  }
});
