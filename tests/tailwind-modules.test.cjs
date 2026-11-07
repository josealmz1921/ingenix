const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const config = require('../tailwind.config.js');

const files = [
  'app/(site)/Home.module.css',
  'src/components/Admin/admin.module.css',
  'src/components/Admin/confirmation.module.css',
  'src/components/Carousel/Carousel.module.css',
  'src/components/Contact/contact.module.css',
  'src/components/Dropzone/dropzone.module.css',
  'src/components/Switch/switch.module.css',
  'src/components/Footer/Footer.module.css',
  'src/components/GridCard/GridCard.module.css',
  'src/components/Header/Header.module.css',
  'src/components/LoadingPage/loading.module.css',
  'src/components/Progress/Progress.module.css',
  'src/components/SectionHeader/SectionHeader.module.css',
];

async function compile(file) {
  return postcss([tailwind({
    ...config,
    content: [{ raw: '<div></div>', extension: 'html' }],
  })]).process(fs.readFileSync(file, 'utf8'), { from: file });
}

function declaration(root, selector, property, media = '') {
  let value;
  const normalize = (text) => text.replace(/\s+/g, ' ').trim();
  root.walkRules((rule) => {
    if (normalize(rule.selector) !== normalize(selector)) return;
    const parentMedia = rule.parent.type === 'atrule' ? rule.parent.params : '';
    if (parentMedia !== media) return;
    rule.walkDecls(property, (node) => { value = node.value; });
  });
  return value;
}

test('site and admin CSS Modules compile @apply without a utility stylesheet or class-name changes', async () => {
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    assert.match(source, /@apply\s/, file);
    const result = await compile(file);
    assert.doesNotMatch(result.css, /@apply\s/, file);
    assert.equal(result.warnings().length, 0, file);
    const selectors = (root) => {
      const found = [];
      root.walkRules((rule) => found.push(rule.selector));
      return found;
    };
    const compiledSelectors = new Set(selectors(result.root));
    for (const selector of selectors(postcss.parse(source))) {
      assert.ok(compiledSelectors.has(selector), `${file}: ${selector}`);
    }
  }
});

test('compiled styles retain responsive navigation, form dimensions and accessible focus', async () => {
  const { root: header } = await compile('src/components/Header/Header.module.css');
  assert.equal(declaration(header, '.Header', 'position'), 'sticky');
  assert.equal(declaration(header, '.nav', 'display'), 'none');
  assert.equal(declaration(header, '.navOpen', 'display'), 'grid');
  assert.equal(declaration(header, '.nav,\n    .navOpen', 'display', '(min-width: 1024px)'), 'flex');
  assert.equal(declaration(header, '.menuToggle', 'display', '(min-width: 1024px)'), 'none');
  assert.equal(declaration(header, '.menuToggle:focus-visible,\n.link:focus-visible', 'outline-offset'), '2px');

  const { root: admin } = await compile('src/components/Admin/admin.module.css');
  assert.equal(declaration(admin, '.shell', 'height'), '100dvh');
  assert.equal(declaration(admin, '.shell', 'grid-template-columns'), '232px minmax(0, 1fr)');
  assert.equal(declaration(admin, '.sidebar', 'position', '(max-width: 767px)'), 'fixed');
  assert.equal(declaration(admin, '.sidebar', 'height', '(max-width: 767px)'), 'calc(80px + env(safe-area-inset-bottom))');
  assert.equal(declaration(admin, '.form input, .form textarea, .form select', 'min-height'), '44px');
  assert.equal(declaration(admin, '.card', 'align-content'), 'start');
  assert.equal(declaration(admin, '.shell', 'composes'), "theme from './theme.module.css'");
});

test('loading art filters and carousel global selectors retain their native behavior', async () => {
  const { root: loading } = await compile('src/components/LoadingPage/loading.module.css');
  assert.equal(declaration(loading, '.fullScreen', 'min-height'), '100svh');
  assert.equal(declaration(loading, '.animation', 'filter'), 'grayscale(1) sepia(1) saturate(3) hue-rotate(165deg)');
  const { root: carousel } = await compile('src/components/Carousel/Carousel.module.css');
  assert.equal(declaration(carousel, '.Carousel :global(.slick-track)', 'display'), 'flex');
  assert.equal(declaration(carousel, '.Carousel :global(.slick-prev)', 'right'), '3.25rem');
});
