const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const createLoader = require('./load-ts.cjs');
const sortableItem = createLoader()('src/components/Dropzone/SortableItem.tsx');
const dropzoneLoader = mocks => createLoader({ './SortableItem': sortableItem, ...mocks });

test('switch retains a native keyboard-accessible input, label and disabled state', () => {
  const { default: Switch } = createLoader()('src/components/Switch/Switch.tsx');
  const html = renderToStaticMarkup(React.createElement(Switch, {
    label: 'Mostrar Instagram', checked: true, disabled: true, hideLabel: true,
    description: 'Visible en el sitio', onChange() {},
  }));
  assert.match(html, /type="checkbox"/);
  assert.match(html, /role="switch"/);
  assert.match(html, /checked=""/);
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-labelledby="[^"]+"/);
  assert.match(html, /aria-describedby="[^"]+"/);
  assert.match(html, /Mostrar Instagram/);
});

test('dropzone enforces one JPG/PNG within 5 MiB and previews an existing image without a URL input', () => {
  let options;
  const { default: Dropzone } = dropzoneLoader({
    'react-dropzone': { useDropzone: input => {
      options = input;
      return {
        getRootProps: props => props,
        getInputProps: props => ({ type: 'file', ...props }),
        isDragActive: false, open() {},
      };
    } },
  })('src/components/Dropzone/Dropzone.tsx');
  const html = renderToStaticMarkup(React.createElement(Dropzone, {
    label: 'Logo', values: [{ preview: 'https://example.test/existing.png' }], alt: 'Logo actual',
    maxFiles: 1, uploading: true, onChange() {},
  }));
  assert.equal(options.multiple, false);
  assert.equal(options.maxFiles, 1);
  assert.equal(options.maxSize, 5 * 1024 * 1024);
  assert.equal(options.minSize, 1);
  assert.equal(options.disabled, true);
  assert.deepEqual(Object.keys(options.accept), ['image/jpeg', 'image/png']);
  assert.match(html, /<img[^>]+alt="Logo actual"/);
  assert.match(html, /role="button"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /Subiendo logo/);
  assert.doesNotMatch(html, /<input[^>]+value="https:/);
  assert.equal((html.match(/type="file"/g) || []).length, 1);
  assert.match(html, /aria-label="Reemplazar logo"/);
  assert.doesNotMatch(html, /Selecciona o arrastra imágenes aquí/);
});

test('all catalogue image fields render independent dropzones; projects preserve image and logo', () => {
  const load = createLoader();
  const { resourceDefinitions, emptyResource } = load('src/content/adminResources.ts');
  const dropzone = dropzoneLoader()('src/components/Dropzone/Dropzone.tsx');
  const switchControl = load('src/components/Switch/Switch.tsx');
  const field = load('src/components/Admin/ResourceField.tsx');
  const editorLoader = createLoader({
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    './useResourceEditor': { useResourceEditor: resource => ({
      definition: resourceDefinitions[resource], creating: true,
      document: { ...emptyResource(resource), image: '/img/existing.png', logo: '/img/existing-logo.png' },
      revision: 0, categories: [], loading: false, busy: false, disabled: false, dirty: false,
      assets: {}, setSlug() {}, change() {}, save() {}, changeAssets() {},
    }) },
    './ResourceField': field,
    '@/src/components/Dropzone/Dropzone': dropzone,
    '@/src/components/Switch/Switch': switchControl,
    '@/src/components/LoadingPage/LoadingPage': { __esModule: true, default: () => null },
  });
  const { default: ResourceEditor } = editorLoader('src/components/Admin/ResourceEditor.tsx');
  for (const resource of ['services', 'projects', 'blog', 'company']) {
    const html = renderToStaticMarkup(React.createElement(ResourceEditor, { resource, id: 'new' }));
    assert.equal((html.match(/type="file"/g) || []).length, resource === 'projects' ? 2 : 1, resource);
    assert.doesNotMatch(html, /<input[^>]+value="\/img\//, resource);
    assert.match(html, /role="switch"/, resource);
  }
});

test('drop selects locally, replaces a single file and rejects batches without invoking any upload', () => {
  let options;
  let selection;
  const { default: Dropzone } = dropzoneLoader({
    'react-dropzone': { useDropzone: input => {
      options = input;
      return { getRootProps: props => props, getInputProps: () => ({ type: 'file' }), open() {} };
    } },
  })('src/components/Dropzone/Dropzone.tsx');
  renderToStaticMarkup(React.createElement(Dropzone, {
    label: 'Imagen', maxFiles: 1, values: [{ preview: '/original.png' }],
    onChange: files => { selection = files; },
  }));
  const file = new File(['image'], 'new.png', { type: 'image/png' });
  options.onDrop([file], []);
  assert.equal(selection.length, 1);
  assert.equal(selection[0].file, file);
  assert.equal(selection[0].position, 0);
  assert.match(selection[0].preview, /^blob:/);
  URL.revokeObjectURL(selection[0].preview);
  selection = undefined;
  options.onDrop([file, file], [{ errors: [{ code: 'too-many-files' }] }]);
  assert.equal(selection, undefined);
});

test('multiple assets append and can be reordered without changing their files', () => {
  let options;
  let dragEnd;
  let selection;
  const { default: Dropzone } = dropzoneLoader({
    '@dnd-kit/core': {
      ...require('@dnd-kit/core'),
      DndContext: ({ onDragEnd, children }) => { dragEnd = onDragEnd; return children; },
    },
    'react-dropzone': { useDropzone: input => {
      options = input;
      return { getRootProps: props => props, getInputProps: () => ({ type: 'file' }), open() {} };
    } },
  })('src/components/Dropzone/Dropzone.tsx');
  const values = [{ preview: '/a.png' }, { preview: '/b.png' }];
  renderToStaticMarkup(React.createElement(Dropzone, {
    label: 'Galería', values, onChange: files => { selection = files; },
  }));
  assert.equal(options.multiple, true);
  dragEnd({ active: { id: '/a.png' }, over: { id: '/b.png' } });
  assert.deepEqual(selection.map(asset => [asset.preview, asset.position]), [['/b.png', 0], ['/a.png', 1]]);
  options.onDrop([new File(['img'], 'c.png', { type: 'image/png' })], []);
  assert.equal(selection.length, 3);
  URL.revokeObjectURL(selection[2].preview);
});

test('invalid image files fail before contacting signing or upload services', async () => {
  const { uploadImage } = createLoader({
    '@/src/firebase/adminRequest': { adminHeaders: async () => { throw new Error('Must not authorize invalid files'); } },
  })('src/utilities/cloudinary.ts');
  await assert.rejects(uploadImage(new File(['text'], 'bad.svg', { type: 'image/svg+xml' })), /JPG o PNG/);
  await assert.rejects(uploadImage(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'huge.png', { type: 'image/png' })), /5 MiB/);
});

async function editorHarness(existingDocument) {
  const slots = [];
  const effects = [];
  const calls = [];
  let cursor = 0;
  let first = true;
  const control = { failFile: null, failSave: false, confirmed: true };
  const { useResourceEditor } = createLoader({
    react: {
      useState(initial) {
        const index = cursor++;
        if (first) slots[index] = typeof initial === 'function' ? initial() : initial;
        return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
      },
      useRef(initial) {
        const index = cursor++;
        if (first) slots[index] = { current: initial };
        return slots[index];
      },
      useEffect(effect) { if (first) effects.push(effect); },
    },
    'next/navigation': { useRouter: () => ({ replace() {} }) },
    sweetalert2: { fire: async () => ({ isConfirmed: control.confirmed }) },
    '@/src/utilities/cloudinary': { uploadImage: async file => {
      calls.push(['upload', file.name]);
      if (file === control.failFile) throw new Error('Upload failed');
      return { secure_url: `https://example.test/${file.name}` };
    } },
    './contentRequest': { contentRequest: async (path, method, body) => {
      if (!method) {
        return path.startsWith('categories')
          ? { records: [], next: null }
          : { document: existingDocument, revision: 2 };
      }
      calls.push(['save', body.document]);
      if (control.failSave) throw new Error('Save failed');
      return { revision: 1 };
    } },
  })('src/components/Admin/useResourceEditor.ts');
  function render() {
    cursor = 0;
    const editor = useResourceEditor('projects', existingDocument ? 'existing-project' : 'new');
    first = false;
    return editor;
  }
  render();
  effects.forEach(effect => effect());
  await new Promise(resolve => setImmediate(resolve));
  return { render, calls, control };
}

test('form uploads image and logo only on submit, then saves their independent URLs', async () => {
  const { render, calls } = await editorHarness();
  const editor = render();
  editor.changeAssets('image', [{ preview: 'blob:image', file: new File(['image'], 'image.png') }]);
  editor.changeAssets('logo', [{ preview: 'blob:logo', file: new File(['logo'], 'logo.png') }]);
  assert.equal(calls.length, 0);
  assert.equal(render().dirty, true);
  await render().save({ preventDefault() {} });
  assert.deepEqual(calls.map(call => call[0]), ['upload', 'upload', 'save']);
  assert.equal(calls[2][1].image, 'https://example.test/image.png');
  assert.equal(calls[2][1].logo, 'https://example.test/logo.png');
  assert.deepEqual(render().assets, {});
  assert.equal(render().dirty, false);
});

test('failed upload retains selection, skips persistence and reuses successful uploads on retry', async () => {
  const { render, calls, control } = await editorHarness();
  const image = new File(['image'], 'image.png');
  const logo = new File(['logo'], 'logo.png');
  render().changeAssets('image', [{ preview: 'blob:image', file: image }]);
  render().changeAssets('logo', [{ preview: 'blob:logo', file: logo }]);
  control.failFile = logo;
  await render().save({ preventDefault() {} });
  assert.deepEqual(calls.map(call => call[0]), ['upload', 'upload']);
  assert.equal(render().assets.logo[0].file, logo);
  assert.equal(render().document.image, '');
  assert.equal(render().error, 'Upload failed');
  control.failFile = null;
  control.failSave = true;
  await render().save({ preventDefault() {} });
  assert.equal(render().error, 'Save failed');
  assert.equal(render().dirty, true);
  control.failSave = false;
  await render().save({ preventDefault() {} });
  assert.deepEqual(calls.map(call => call[0]), ['upload', 'upload', 'upload', 'save', 'save']);
  assert.equal(render().dirty, false);
});

test('cancelled publication does not upload selected files', async () => {
  const { render, calls, control } = await editorHarness();
  render().change('published', true);
  render().changeAssets('image', [{ preview: 'blob:image', file: new File(['image'], 'image.png') }]);
  control.confirmed = false;
  await render().save({ preventDefault() {} });
  assert.deepEqual(calls, []);
  assert.equal(render().dirty, true);
});

test('existing images load into the dropzone and saving unchanged assets never uploads them', async () => {
  const { emptyResource } = createLoader()('src/content/adminResources.ts');
  const document = {
    ...emptyResource('projects'), image: 'https://example.test/existing.png',
    imageAlt: 'Imagen existente', logo: 'https://example.test/logo.png', logoAlt: 'Logo existente',
  };
  const { render, calls } = await editorHarness(document);
  assert.equal(render().document.image, document.image);
  assert.equal(render().dirty, false);
  await render().save({ preventDefault() {} });
  assert.deepEqual(calls, [['save', document]]);
  // Even an existing asset emitted through onChange has no File to upload.
  render().changeAssets('image', [{ preview: document.image, position: 0 }]);
  await render().save({ preventDefault() {} });
  assert.equal(calls.filter(call => call[0] === 'upload').length, 0);
  assert.equal(render().document.image, document.image);
});

test('removing an existing image changes only the draft until submit and does not upload it', async () => {
  const { emptyResource } = createLoader()('src/content/adminResources.ts');
  const document = { ...emptyResource('projects'), image: 'https://example.test/old.png', imageAlt: 'Antes' };
  const { render, calls } = await editorHarness(document);
  render().changeAssets('image', []);
  assert.deepEqual(calls, []);
  assert.equal(render().document.image, '');
  assert.equal(render().document.imageAlt, '');
  await render().save({ preventDefault() {} });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'save');
  assert.equal(calls[0][1].image, '');
});

test('confirmed removal emits onDelete and onChange; cancellation keeps the stored asset', async () => {
  const runtime = require('react/jsx-runtime');
  const asset = { preview: 'https://example.test/stored.png' };
  let remove;
  let confirmed = false;
  const events = [];
  const { default: Dropzone } = dropzoneLoader({
    'react/jsx-runtime': {
      ...runtime,
      jsx(type, props, key) {
        if (type === 'button' && props['aria-label']?.startsWith('Quitar')) remove = props.onClick;
        return runtime.jsx(type, props, key);
      },
    },
    sweetalert2: { fire: async () => ({ isConfirmed: confirmed }) },
  })('src/components/Dropzone/Dropzone.tsx');
  renderToStaticMarkup(React.createElement(Dropzone, {
    label: 'Imagen', values: [asset], maxFiles: 1,
    onDelete: file => { events.push(['delete', file]); },
    onChange: files => { events.push(['change', files]); },
  }));
  remove();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(events, []);
  confirmed = true;
  remove();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(events, [['delete', asset], ['change', []]]);
});
