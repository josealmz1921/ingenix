const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('Ingenix SVG icon is self-contained and uses the site wordmark colors', () => {
  const svg = fs.readFileSync('app/icon.svg', 'utf8');
  assert.match(svg, /<title>Ingenix<\/title>/);
  assert.match(svg, /viewBox="0 0 64 64"/);
  for (const color of ['#0a0f1e', '#ffffff', '#77aaff']) assert.ok(svg.includes(color));
  assert.doesNotMatch(svg, /<text\b|<image\b|<script\b|(?:href|src)=/i);
});

function pngSize(buffer) {
  assert.equal(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

test('favicon includes 16, 32 and 48 pixel PNG images for browser tabs', () => {
  const ico = fs.readFileSync('app/favicon.ico');
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  for (const [index, size] of [16, 32, 48].entries()) {
    const entry = 6 + index * 16;
    assert.equal(ico[entry], size);
    assert.equal(ico[entry + 1], size);
    assert.equal(ico.readUInt16LE(entry + 6), 32);
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    assert.ok(offset + length <= ico.length);
    assert.deepEqual(pngSize(ico.subarray(offset, offset + length)), [size, size]);
  }
});

test('Apple touch icon is a 180 pixel PNG', () => {
  assert.deepEqual(pngSize(fs.readFileSync('app/apple-icon.png')), [180, 180]);
});
