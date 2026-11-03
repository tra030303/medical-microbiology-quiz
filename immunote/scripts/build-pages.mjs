import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve, relative, basename, sep } from 'node:path';

// GitHub Pages needs only the browser application, not the Sites deployment ID.
const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
let output = 'dist-pages';
if (args.length) {
  if (args.length !== 2 || args[0] !== '--output') throw new Error('Usage: node scripts/build-pages.mjs [--output <project-relative-directory>]');
  output = args[1];
}
const target = resolve(root, output);
const local = relative(root, target);
if (!local || local.startsWith('..' + sep) || local === '..' || ['src', 'data', 'scripts', 'tests', '.git', '.github', '.openai'].some(name => local === name || local.startsWith(name + sep))) {
  throw new Error('The Pages output must be a separate generated directory inside this project.');
}
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const name of ['index.html', 'favicon.svg', 'src', 'data']) {
  await cp(resolve(root, name), resolve(target, name), {
    recursive: true,
    filter: path => !basename(path).startsWith('.'),
  });
}
await writeFile(resolve(target, '.nojekyll'), '');
console.log(`Built GitHub Pages artifact in ${local}/ (no Sites metadata, credentials, or local study records)`);
