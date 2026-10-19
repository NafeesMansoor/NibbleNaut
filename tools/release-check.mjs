#!/usr/bin/env node
/**
 * Release gate (docs/PWA.md §8). Run after `npm run build`:  npm run release:check
 *
 * Fails when the version is invalid or not bumped, the changelog lacks the version, or the built
 * service worker, precache list, manifest or bundle are inconsistent with it.
 * A MAJOR bump additionally requires ALLOW_MAJOR=1 (explicit approval).
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const errors = [];
const notes = [];
const fail = (msg) => errors.push(msg);

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const parse = (v) => v.match(SEMVER)?.slice(1).map(Number) ?? null;
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
};

// Files whose changes alter the deployed app.
const DEPLOYED = ['src', 'public', 'index.html', 'vite.config.ts', 'tools/sw-plugin.ts', 'package.json', 'package-lock.json'];

// 1. Version is valid semver and bumped relative to released tags.
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const v = parse(version);
if (!v) fail(`package.json version "${version}" is not MAJOR.MINOR.PATCH.`);

if (v) {
  const tags = (git("tag --list 'v*'") ?? '').split('\n').map((t) => t.trim()).filter((t) => parse(t.slice(1)));
  const versions = tags.map((t) => parse(t.slice(1))).sort(cmp);
  const sameTag = tags.includes(`v${version}`);
  if (sameTag) {
    // Already released: the deployed files must not have changed since that tag.
    const diff = git(`diff --name-only v${version} -- ${DEPLOYED.join(' ')}`);
    if (diff) fail(`v${version} is already released but these deployed files changed since: ${diff.split('\n').join(', ')}. Bump the version.`);
    else notes.push(`v${version} matches its release tag.`);
  } else if (versions.length === 0) {
    notes.push('No release tags yet; skipping the bump comparison.');
  } else {
    const prev = versions[versions.length - 1];
    const prevStr = prev.join('.');
    if (cmp(v, prev) <= 0) fail(`Version ${version} must be greater than the last release v${prevStr}.`);
    else if (v[0] > prev[0] && process.env.ALLOW_MAJOR !== '1')
      fail(`Major bump v${prevStr} → ${version} needs explicit approval: re-run with ALLOW_MAJOR=1.`);
    else if (v[0] === prev[0] && v[1] === prev[1] && v[2] !== prev[2] + 1)
      notes.push(`Patch jumped from ${prev[2]} to ${v[2]}; intended?`);
    else notes.push(`Bump v${prevStr} → ${version}.`);
  }
}

// 2. Changelog has an entry for this version.
const changelog = existsSync('CHANGELOG.md') ? readFileSync('CHANGELOG.md', 'utf8') : '';
if (!new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\] - \\d{4}-\\d{2}-\\d{2}`, 'm').test(changelog))
  fail(`CHANGELOG.md has no "## [${version}] - YYYY-MM-DD" entry.`);

// 3. Build output is consistent with the version.
const dist = 'dist';
const listFiles = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const full = join(dir, n);
    return statSync(full).isDirectory() ? listFiles(full) : [relative(dist, full).split('\\').join('/')];
  });

if (!existsSync(join(dist, 'sw.js'))) {
  fail('dist/sw.js missing: run `npm run build` first.');
} else {
  const sw = readFileSync(join(dist, 'sw.js'), 'utf8');
  if (!sw.includes(`const VERSION = '${version}';`)) fail(`dist/sw.js does not embed version ${version}.`);
  if (/__APP_VERSION__|__PRECACHE__/.test(sw)) fail('dist/sw.js still contains template placeholders.');
  const m = sw.match(/const PRECACHE = (\[[\s\S]*?\]);/);
  const precache = m ? JSON.parse(m[1]).map((u) => u.replace(/^\.\//, '')) : [];
  if (!precache.length) fail('dist/sw.js has an empty precache list.');
  for (const f of precache) if (!existsSync(join(dist, f))) fail(`Precached file missing from dist: ${f}`);
  const ignored = new Set(['sw.js', '_headers', '_redirects']);
  for (const f of listFiles(dist)) {
    if (f.endsWith('.map')) fail(`Source map in production build: ${f}`);
    else if (!ignored.has(f) && !precache.includes(f)) fail(`Built file not precached (offline would break): ${f}`);
  }

  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  if (!html.includes('href="./manifest.webmanifest"')) fail('dist/index.html does not link ./manifest.webmanifest.');
  if (html.includes('/src/')) fail('dist/index.html still references /src/ (dev entry point).');

  const manifestPath = join(dist, 'manifest.webmanifest');
  if (!existsSync(manifestPath)) fail('dist/manifest.webmanifest missing.');
  else {
    const mf = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (mf.start_url !== './' || mf.scope !== './') fail('Manifest start_url and scope must be "./" (relative hosting).');
    for (const icon of mf.icons ?? []) if (!existsSync(join(dist, icon.src))) fail(`Manifest icon missing: ${icon.src}`);
    if (!(mf.icons ?? []).some((i) => i.sizes === '512x512')) fail('Manifest needs a 512x512 icon.');
  }

  const js = listFiles(dist).filter((f) => f.endsWith('.js') && f !== 'sw.js');
  const quoted = new RegExp(`["'\`]${version.replace(/\./g, '\\.')}["'\`]`);
  if (!js.some((f) => quoted.test(readFileSync(join(dist, f), 'utf8'))))
    fail(`Built game bundle does not contain version "${version}" (displayed version would drift).`);
}

for (const n of notes) console.log(`  note: ${n}`);
if (errors.length) {
  console.error(`\nRelease check FAILED for v${version}:`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(`Release check passed for v${version}.`);
