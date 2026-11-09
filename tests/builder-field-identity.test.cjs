const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const runtime = require('react/jsx-runtime');
const { renderToStaticMarkup } = require('react-dom/server');
const createLoader = require('./load-ts.cjs');

function fieldHarness(initial, fields) {
  let state = initial;
  const controls = [];
  const load = createLoader({
    'react/jsx-runtime': {
      ...runtime,
      jsx(type, props, key) {
        if (type === 'input' || type === 'textarea') controls.push(props);
        return runtime.jsx(type, props, key);
      },
    },
  });
  const { default: Fields } = load('src/components/PageBuilder/Fields.tsx');
  const html = renderToStaticMarkup(React.createElement(Fields, {
    fields, value: state, prefix: 'test',
    onChange: update => { state = typeof update === 'function' ? update(state) : update; },
  }));
  return { html, controls, state: () => state };
}

test('two field events from the same render preserve each other instead of restoring a stale snapshot', () => {
  const harness = fieldHarness({ title: 'Original', description: 'Antes' }, [
    { name: 'title', kind: 'text', label: 'Título' },
    { name: 'description', kind: 'textarea', label: 'Descripción' },
  ]);
  harness.controls[0].onChange({ target: { value: 'Título nuevo' } });
  harness.controls[1].onChange({ target: { value: 'Descripción nueva' } });
  assert.deepEqual(harness.state(), { title: 'Título nuevo', description: 'Descripción nueva' });
});

test('nested field events update only their own property', () => {
  const harness = fieldHarness({ image: { src: '/old.png', alt: 'Antes' } }, [
    { name: 'image', kind: 'object', label: 'Imagen', fields: [
      { name: 'src', kind: 'text', label: 'Archivo' },
      { name: 'alt', kind: 'text', label: 'Descripción' },
    ] },
  ]);
  harness.controls[0].onChange({ target: { value: '/new.png' } });
  harness.controls[1].onChange({ target: { value: 'Después' } });
  assert.deepEqual(harness.state().image, { src: '/new.png', alt: 'Después' });
});

test('inline edits follow their original list item after reorder and ignore removed targets', () => {
  const load = createLoader();
  const { updateInlineText } = load('src/components/PageBuilder/inlineEditing.ts');
  const { inlineFieldKey } = load('src/components/PageBuilder/fieldIdentity.ts');
  const source = {
    id: 'buttons', type: 'text', visible: true, variant: 'left', tone: 'plain',
    content: { title: 'Texto', actions: [{ label: 'Primero', href: '/a' }, { label: 'Segundo', href: '/b' }] },
  };
  let current = { ...source, content: { ...source.content, actions: [...source.content.actions].reverse() } };
  const originalKey = inlineFieldKey(source, 'content.actions.0.label');
  assert.equal(inlineFieldKey(current, 'content.actions.1.label'), originalKey);
  current = updateInlineText(current, 'content.actions.0.label', 'Primero editado', source);
  assert.equal(inlineFieldKey(current, 'content.actions.1.label'), originalKey);
  assert.deepEqual(current.content.actions.map(item => item.label), ['Segundo', 'Primero editado']);
  assert.equal(source.content.actions[0].label, 'Primero');
  assert.equal(current.content.actions[0], source.content.actions[1]);
  const removed = { ...source, content: { ...source.content, actions: [source.content.actions[1]] } };
  assert.equal(updateInlineText(removed, 'content.actions.0.label', 'No copiar', source), removed);

  const cards = {
    id: 'cards', type: 'cards', visible: true, variant: 'default', columns: 2, tone: 'plain',
    content: { title: 'Tarjetas', items: [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }] },
  };
  const reordered = structuredClone(cards);
  reordered.content.items.reverse();
  const result = updateInlineText(reordered, 'content.items.0.title', 'Solo A', cards);
  assert.deepEqual(result.content.items.map(item => item.title), ['B', 'Solo A']);
});

test('filtered contact actions retain their original targets for hero, text and banner edits', () => {
  const load = createLoader();
  const { composeHomeContact } = load('src/content/contact.ts');
  const { composeHomeCatalogs } = load('src/content/homeCatalogs.ts');
  const { updateInlineText } = load('src/components/PageBuilder/inlineEditing.ts');
  const { inlineFieldKey } = load('src/components/PageBuilder/fieldIdentity.ts');
  const { createBlock } = load('src/page-builder/registry/create-block.ts');
  const { initialPage } = load('src/components/PageBuilder/initialPage.ts');
  for (const type of ['hero', 'text', 'banner']) {
    for (const href of ['#contacto', '/#contacto']) {
      const source = createBlock(type, 'editable');
      source.content.actions = [
        { label: 'Hablemos de tu proyecto', href },
        { label: 'Conoce nuestra experiencia', href: '#experiencia' },
        { label: '', href: '' },
      ];
      const page = { ...initialPage(), sections: [source] };
      const rendered = composeHomeContact(composeHomeCatalogs(page, [], []), { address: '', links: [] }).sections[0];
      assert.equal(source.content.actions.length, 3);
      assert.equal(rendered.content.actions.length, 2);
      assert.equal(
        inlineFieldKey(rendered, 'content.actions.1.label'),
        inlineFieldKey(source, 'content.actions.2.label'),
      );
      let edited = updateInlineText(source, 'content.actions.1.label', 'Prueba', rendered);
      assert.deepEqual(edited.content.actions.map(action => action.label), [
        'Hablemos de tu proyecto', 'Conoce nuestra experiencia', 'Prueba',
      ], `${type}: editing the second visible button must change the third stored button`);
      edited = updateInlineText(edited, 'content.actions.0.label', 'Experiencia editada', rendered);
      assert.deepEqual(edited.content.actions.map(action => action.label), [
        'Hablemos de tu proyecto', 'Experiencia editada', 'Prueba',
      ]);
      assert.deepEqual(edited.content.actions.map(action => action.href), [href, '#experiencia', '']);
      assert.equal(source.content.actions[2].label, '', 'the source snapshot must not be mutated');
      const visibleAgain = composeHomeContact({ ...page, sections: [edited] }, { address: '', links: [] }).sections[0];
      assert.deepEqual(visibleAgain.content.actions.map(action => action.label), ['Experiencia editada', 'Prueba']);
    }
  }
});

test('canvas text events carry the displayed projection in both rendered and incomplete-block modes', () => {
  const controls = [];
  const load = createLoader({
    '@/src/page-builder': { PageRenderer: ({ document, renderText }) => (
      React.createElement('div', null, document.sections[0].content.actions.map((action, index) => (
        React.createElement('div', { key: index }, renderText('editable', `content.actions.${index}.label`, action.label))
      )))
    ) },
    '@/src/components/Contact/HomePageRenderer': { __esModule: true, default: () => null },
    './InlineText': { __esModule: true, default: props => {
      controls.push(props);
      return React.createElement('span', null, props.value);
    } },
  });
  const { SortableCanvasBlock } = load('src/components/PageBuilder/BuilderParts.tsx');
  const { composeHomeContact } = load('src/content/contact.ts');
  const { initialPage } = load('src/components/PageBuilder/initialPage.ts');
  const { updateInlineText } = load('src/components/PageBuilder/inlineEditing.ts');
  const section = {
    id: 'editable', type: 'text', variant: 'left', tone: 'plain', visible: true,
    content: { title: 'Texto', actions: [
      { label: 'Contacto oculto', href: '#contacto' },
      { label: 'Experiencia', href: '/experiencia' },
      { label: '', href: '' },
    ] },
  };
  const page = composeHomeContact({ ...initialPage(), sections: [section] }, { address: '', links: [] });
  for (const valid of [false, true]) {
    controls.length = 0;
    let edited = section;
    renderToStaticMarkup(React.createElement(SortableCanvasBlock, {
      block: page.sections[0], page, index: 0, selected: true, disabled: false, scale: 1,
      valid, toolbar: null, onSelect() {},
      onTextChange(source, path, value) {
        assert.equal(source, page.sections[0]);
        edited = updateInlineText(edited, path, value, source);
      },
    }));
    const target = controls.find(control => control.label === 'Texto del botón' && control.value === '');
    assert.ok(target, 'the newly added button must be inline-editable');
    target.onChange('Prueba');
    assert.deepEqual(edited.content.actions.map(action => action.label), ['Contacto oculto', 'Experiencia', 'Prueba']);
  }
});

test('separate Fields instances use unique DOM ids even when their field names and prefixes match', () => {
  const load = createLoader();
  const { default: Fields } = load('src/components/PageBuilder/Fields.tsx');
  const props = {
    fields: [{ name: 'title', kind: 'text', label: 'Título' }],
    value: { title: '' }, prefix: 'same-prefix', onChange() {},
  };
  const html = renderToStaticMarkup(React.createElement('div', null,
    React.createElement(Fields, props), React.createElement(Fields, props),
  ));
  const ids = [...html.matchAll(/<input[^>]+id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 2);
  assert.equal(new Set(ids).size, 2);
  for (const id of ids) assert.ok(html.includes(`for="${id}"`));
});

test('list identity survives edits and reorder; delayed edits cannot change another or deleted item', () => {
  const { createListIdentity } = createLoader()('src/components/PageBuilder/fieldIdentity.ts');
  const identity = createListIdentity('list');
  const first = { title: 'Primero' };
  const second = { title: 'Segundo' };
  const key = identity.keyFor(first);
  assert.notEqual(key, identity.keyFor(second));
  let items = [second, first];
  items = identity.update(items, key, current => ({ ...current, title: 'Solo primero' }));
  assert.equal(items[0], second);
  assert.equal(items[1].title, 'Solo primero');
  assert.equal(identity.keyFor(items[1]), key);
  items = items.slice(0, 1);
  assert.deepEqual(identity.update(items, key, () => ({ title: 'No resucitar' })), [second]);
  assert.notEqual(identity.keyFor({ title: 'Nuevo' }), key);
});

test('block edits target stable ids after inserting, duplicating and reordering, preserving other changes', () => {
  const load = createLoader();
  const { initialPage } = load('src/components/PageBuilder/initialPage.ts');
  const { insertBlock, duplicateBlock, moveBlockToGap, updateBlockById } = load('src/components/PageBuilder/editorOperations.ts');
  const { updateInlineText } = load('src/components/PageBuilder/inlineEditing.ts');
  let page = { ...initialPage(), sections: [] };
  page = insertBlock(page, 'text', 0, 'first');
  page = duplicateBlock(page, 0, 'second');
  page = insertBlock(page, 'text', 0, 'third');
  page = { ...page, sections: moveBlockToGap(page.sections, 2, 0) };
  page = updateBlockById(page, 'first', block => updateInlineText(block, 'content.title', 'Primero'));
  page = updateBlockById(page, 'second', block => updateInlineText(block, 'content.title', 'Segundo'));
  assert.deepEqual(page.sections.map(block => [block.id, block.content.title]), [
    ['second', 'Segundo'], ['third', 'Texto'], ['first', 'Primero'],
  ]);
  page = { ...page, sections: page.sections.filter(block => block.id !== 'first') };
  assert.equal(updateBlockById(page, 'first', block => ({ ...block, visible: false })), page);
  const { editorItemKey } = load('src/components/PageBuilder/fieldIdentity.ts');
  const key = editorItemKey(page.sections[0]);
  page = updateBlockById(page, 'second', block => ({ ...block, id: 'renamed' }));
  assert.equal(editorItemKey(page.sections[0]), key, 'renaming the anchor must not remount the focused inspector');
});

test('inline blur does not resubmit unchanged content from a previous render', () => {
  let span;
  const changes = [];
  const { default: InlineText } = createLoader({
    'react/jsx-runtime': {
      ...runtime,
      jsx(type, props, key) {
        if (type === 'span') span = props;
        return runtime.jsx(type, props, key);
      },
    },
  })('src/components/PageBuilder/InlineText.tsx');
  renderToStaticMarkup(React.createElement(InlineText, {
    value: 'Antes', label: 'Título', multiline: false, disabled: false,
    onChange: value => changes.push(value), onSelect() {},
  }));
  span.ref.current = { innerText: 'Antes' };
  span.onBlur();
  assert.deepEqual(changes, []);
  span.ref.current.innerText = 'Después';
  span.onInput();
  span.onBlur();
  assert.deepEqual(changes, ['Después']);
});
