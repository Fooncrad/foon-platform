import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const sourceRoots = ['app', 'components'];
const extensions = /\.(?:tsx|ts|css)$/;

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    const stat = statSync(full);
    return stat.isDirectory() ? walk(full) : extensions.test(name) ? [full] : [];
  });
}

const files = sourceRoots.flatMap(dir => walk(join(root, dir)));

test('root layout always mounts the viewport stability guard', () => {
  const layout = readFileSync(join(root, 'app/layout.tsx'), 'utf8');
  assert.match(layout, /ViewportStabilityGuard/);
});

test('global CSS contains immutable horizontal viewport guards', () => {
  const css = readFileSync(join(root, 'app/globals.css'), 'utf8');
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /overscroll-behavior-x:\s*none/);
  assert.match(css, /touch-action:\s*pan-y pinch-zoom/);
  assert.match(css, /--foon-visual-height/);
});

test('application source does not introduce document-width viewport units', () => {
  const offenders = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      // CSS guard selectors may mention utility names; declarations/usages are forbidden.
      if (/\b(?:width|min-width|max-width|inline-size)\s*:\s*100vw\b/.test(line) ||
          /className\s*=.*\b(?:w-screen|min-w-screen)\b/.test(line)) {
        offenders.push(relative(root, file) + ':' + (index + 1));
      }
    });
  }
  assert.deepEqual(offenders, [], 'Viewport-width regressions found: ' + offenders.join(', '));
});

test('checkout fields retain iOS-safe sizing and stable mobile geometry', () => {
  const css = readFileSync(join(root, 'app/globals.css'), 'utf8');
  assert.match(css, /menu-checkout-form[\s\S]*font-size:\s*16px!important/);
  assert.match(css, /menu-checkout[\s\S]*max-height:\s*100dvh!important/);
});
