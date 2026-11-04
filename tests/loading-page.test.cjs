const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const createLoader = require('./load-ts.cjs');

test('loading screen renders an accessible status and static CPU before JavaScript', () => {
  const load = createLoader();
  const { default: LoadingPage } = load('src/components/LoadingPage/LoadingPage.tsx');
  const html = renderToStaticMarkup(React.createElement(LoadingPage, {
    message: 'Comprobando acceso…', fullScreen: true,
  }));
  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /Comprobando acceso…/);
  assert.match(html, /INGENIX/);
  assert.match(html, /<svg/);
  assert.doesNotMatch(html, /<iframe|<script/);
});

test('CPU animation is local vector data without external assets and retains its license', () => {
  const file = path.join(__dirname, '../public/animations/cpu-loading.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(data.w, 520);
  assert.equal(data.h, 520);
  assert.ok(data.op > data.ip);
  assert.ok(data.layers.length > 0);
  assert.ok(fs.statSync(file).size < 40 * 1024);
  assert.doesNotMatch(JSON.stringify(data), /https?:|data:/);
  for (const asset of data.assets) {
    assert.equal(asset.p, undefined);
    assert.equal(asset.u, undefined);
  }
  const license = fs.readFileSync(path.join(__dirname, '../public/animations/LICENSE.txt'), 'utf8');
  assert.match(license, /MD Abdur/);
  assert.match(license, /Lottie Simple License/);
});
