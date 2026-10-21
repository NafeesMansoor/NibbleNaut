#!/usr/bin/env node
/**
 * Regenerates every icon from the mascot drawing in tools/mascot.mjs:  node tools/make-icons.mjs
 *
 *   public/favicon.svg                 browser tab icon (vector)
 *   public/mascot.svg                  transparent mascot used on the home screen
 *   public/icons/icon-192.png          PWA icon
 *   public/icons/icon-512.png          PWA icon
 *   public/icons/maskable-512.png      PWA maskable icon (fish inside the safe zone)
 *   public/icons/apple-touch-icon.png  iPhone/iPad home screen (180×180)
 *   store/icon-1024.png                App Store / Play Store listing icon (not shipped in the app)
 *
 * PNGs are rendered with a local Chrome/Chromium in headless mode (set CHROME=/path/to/chrome if
 * it isn't in the default macOS location). Commit the outputs; the build doesn't run this.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { mascotSvg } from './mascot.mjs';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(import.meta.dirname, '..');
const work = mkdtempSync(join(tmpdir(), 'nibblenaut-icons-'));

writeFileSync(join(root, 'public/favicon.svg'), mascotSvg({ background: true }));
writeFileSync(join(root, 'public/mascot.svg'), mascotSvg({ background: false }));

function png(svg, size, out) {
  const html = join(work, `icon-${size}.html`);
  writeFileSync(html, `<!doctype html><html><body style="margin:0;overflow:hidden">${svg.replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`);
  mkdirSync(join(out, '..'), { recursive: true });
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${join(work, 'profile')}`, `--window-size=${size},${size}`, `--screenshot=${out}`, `file://${html}`], { stdio: 'ignore' });
  console.log(`wrote ${out.replace(root + '/', '')}`);
}

const icon = mascotSvg({ background: true });
png(icon, 192, join(root, 'public/icons/icon-192.png'));
png(icon, 512, join(root, 'public/icons/icon-512.png'));
png(mascotSvg({ background: true, scale: 0.8 }), 512, join(root, 'public/icons/maskable-512.png'));
png(icon, 180, join(root, 'public/icons/apple-touch-icon.png'));
png(icon, 1024, join(root, 'store/icon-1024.png'));
rmSync(work, { recursive: true, force: true });
