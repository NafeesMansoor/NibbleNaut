import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Plugin } from 'vite';

/** Public files that are host configuration, not part of the app. */
const NOT_PRECACHED = new Set(['_headers', '_redirects']);

function listFiles(dir: string, root = dir): string[] {
  let out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out = out.concat(listFiles(full, root));
    else out.push(relative(root, full).split('\\').join('/'));
  }
  return out;
}

/**
 * Emits dist/sw.js from src/pwa/sw.template.js with the app version and the full list of build
 * outputs to precache. The version comes from package.json (the single version source), so the
 * service worker script changes on every release and browsers detect the update.
 */
export function serviceWorker(version: string, publicDir = 'public'): Plugin {
  return {
    name: 'fish-fight-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = new Set<string>(['index.html']);
      for (const name of Object.keys(bundle)) if (!name.endsWith('.map')) files.add(name);
      for (const name of listFiles(publicDir)) if (!NOT_PRECACHED.has(name)) files.add(name);
      files.delete('sw.js');
      const precache = [...files].sort().map((f) => `./${f}`);
      const source = readFileSync('src/pwa/sw.template.js', 'utf8')
        .replace('__APP_VERSION__', version)
        .replace('__PRECACHE__', JSON.stringify(precache, null, 2));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}
