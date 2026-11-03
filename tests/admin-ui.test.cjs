const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const createLoader = require('./load-ts.cjs');

test('admin navigation keeps parent sections active on nested editor routes', () => {
  const { adminNavigation, isActiveAdminPath } = createLoader()('src/components/Admin/navigation.ts');
  assert.equal(adminNavigation.length, 7);
  assert.equal(isActiveAdminPath('/dashboard', '/dashboard'), true);
  assert.equal(isActiveAdminPath('/dashboard/pages/home', '/dashboard'), false);
  assert.equal(isActiveAdminPath('/dashboard/pages/home', '/dashboard/pages'), true);
  assert.equal(isActiveAdminPath('/dashboard/services/new', '/dashboard/services'), true);
  assert.equal(isActiveAdminPath('/dashboard/services-other', '/dashboard/services'), false);
});

function luminance(hex) {
  const rgb = hex.match(/[a-f\d]{2}/gi).map(channel => {
    const value = parseInt(channel, 16) / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}

test('Ingenix admin text and feedback tokens meet WCAG AA text contrast', () => {
  const theme = fs.readFileSync('src/components/Admin/theme.module.css', 'utf8');
  const tokens = Object.fromEntries([...theme.matchAll(/--admin-([\w-]+):\s*(#[a-f\d]{6})/gi)].map(match => [match[1], match[2]]));
  for (const [foreground, background] of [
    ['text', 'background'], ['text', 'surface'], ['muted', 'surface'], ['muted', 'raised'],
    ['accent', 'selected'], ['danger', 'danger-surface'], ['success', 'success-surface'],
    ['warning', 'warning-surface'], ['#ffffff', 'primary'], ['#ffffff', 'primary-hover'],
  ]) {
    const a = luminance(tokens[foreground] || foreground);
    const b = luminance(tokens[background]);
    assert.ok((Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5, `${foreground} on ${background}`);
  }
  assert.doesNotMatch(theme, /--pb-[\w-]+\s*:/, 'admin tokens must not override the renderer theme');
});

test('builder and catalogue confirmations share accessible dark-theme presentation', () => {
  const load = createLoader({ './confirmation.module.css': {
    __esModule: true, default: { popup: 'popup theme', title: 'title', text: 'text', actions: 'actions', confirm: 'confirm', cancel: 'cancel', danger: 'danger' },
  } });
  const { confirmationTheme } = load('src/components/Admin/confirmationTheme.ts');
  for (const danger of [false, true]) {
    const options = confirmationTheme(danger);
    assert.equal(options.focusCancel, true);
    assert.equal(options.showCancelButton, true);
    assert.equal(options.buttonsStyling, false);
    assert.equal(options.customClass.popup, 'popup theme');
    assert.equal(options.customClass.confirmButton, danger ? 'danger' : 'confirm');
  }
});
