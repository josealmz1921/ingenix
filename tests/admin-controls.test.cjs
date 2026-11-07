const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const createLoader = require('./load-ts.cjs');

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
  const { default: Dropzone } = createLoader({
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
    label: 'Logo', value: 'https://example.test/existing.png', alt: 'Logo actual',
    uploading: true, onUpload: async () => {}, onRemove() {},
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
});

test('all catalogue image fields render independent dropzones; projects preserve image and logo', () => {
  const load = createLoader();
  const { resourceDefinitions, emptyResource } = load('src/content/adminResources.ts');
  const dropzone = load('src/components/Dropzone/Dropzone.tsx');
  const switchControl = load('src/components/Switch/Switch.tsx');
  const field = load('src/components/Admin/ResourceField.tsx');
  const editorLoader = createLoader({
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    './useResourceEditor': { useResourceEditor: resource => ({
      definition: resourceDefinitions[resource], creating: true,
      document: { ...emptyResource(resource), image: '/img/existing.png', logo: '/img/existing-logo.png' },
      revision: 0, categories: [], loading: false, busy: false, disabled: false, dirty: false,
      setSlug() {}, change() {}, save() {}, upload: async () => {}, removeImage() {},
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

test('invalid image files fail before contacting signing or upload services', async () => {
  const { uploadImage } = createLoader({
    '@/src/firebase/adminRequest': { adminHeaders: async () => { throw new Error('Must not authorize invalid files'); } },
  })('src/utilities/cloudinary.ts');
  await assert.rejects(uploadImage(new File(['text'], 'bad.svg', { type: 'image/svg+xml' })), /JPG o PNG/);
  await assert.rejects(uploadImage(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'huge.png', { type: 'image/png' })), /5 MiB/);
});
