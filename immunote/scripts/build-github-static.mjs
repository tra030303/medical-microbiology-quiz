import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

// Existing GitHub Pages branch deployments serve this directory as immunote/.
// Pack original scans into lazy ES modules to avoid over 1,000 GitHub blob writes.
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'outputs/github-static');
const prefix = 'immunote/';
const targetPackBytes = 512 * 1024;
const maximumPackBytes = 700_000;
const build = spawnSync(process.execPath, [resolve(root, 'scripts/build-pages.mjs'), '--output', 'outputs/github-static'], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) throw new Error('The base GitHub Pages build failed.');

const imageDirectory = resolve(output, 'data/past-images');
const packDirectory = resolve(output, 'data/scan-packs');
const indexPath = resolve(output, 'data/scan-index.js');
let imageFiles = [];
try { imageFiles = (await readdir(imageDirectory)).filter(name => /^[a-z0-9-]+\.webp$/.test(name)).sort(); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

let packCount = 0;
let scanCount = 0;
if (imageFiles.length) {
  await rm(packDirectory, { recursive: true, force: true });
  await mkdir(packDirectory, { recursive: true });
  const index = {};
  let current = {};
  let bytes = 0;
  const wrap = values => 'export const SCANS = ' + JSON.stringify(values) + ';\n';
  async function flush() {
    if (!Object.keys(current).length) return;
    const name = 'part-' + String(++packCount).padStart(3, '0') + '.js';
    const source = wrap(current);
    if (Buffer.byteLength(source) > maximumPackBytes) throw new Error('A scan module exceeds the bounded upload size.');
    for (const filename of Object.keys(current)) index[filename] = name;
    await writeFile(join(packDirectory, name), source);
    current = {}; bytes = 0;
  }
  for (const filename of imageFiles) {
    const data = await readFile(join(imageDirectory, filename));
    const url = 'data:image/webp;base64,' + data.toString('base64');
    const entryBytes = Buffer.byteLength(JSON.stringify(filename) + ':' + JSON.stringify(url) + ',');
    if (entryBytes + 40 > maximumPackBytes) throw new Error('A single scan exceeds the upload size: ' + filename);
    if (bytes && bytes + entryBytes + 40 > targetPackBytes) await flush();
    current[filename] = url; bytes += entryBytes; scanCount++;
  }
  await flush();
  await writeFile(indexPath, '// Lazy scan-module index generated for GitHub Pages.\nexport const SCAN_INDEX = ' + JSON.stringify(index) + ';\n');
  await rm(imageDirectory, { recursive: true });
} else {
  // A future clone from GitHub already has packed scans, so preserve them.
  const index = await readFile(indexPath, 'utf8');
  if (!/export const SCAN_INDEX = \{/.test(index)) throw new Error('Neither original scans nor a packed scan index is available.');
  const packs = (await readdir(packDirectory)).filter(name => /^part-\d+\.js$/.test(name));
  packCount = packs.length;
  const match = index.match(/export const SCAN_INDEX = (\{[\s\S]*\});/);
  scanCount = Object.keys(JSON.parse(match[1])).length;
}

// Generated question images have their own lazy packs so adding them never
// changes the original scan modules or their Git blob identities.
const questionImageDirectory = resolve(output, 'data/question-images');
const questionImagePackDirectory = resolve(output, 'data/question-image-packs');
const questionImageIndexPath = resolve(output, 'data/question-image-index.js');
const questionImageName = /^histology-\d{3}(?:-[ab])?\.webp$/;
let questionImageFiles = [];
try {
  const names = await readdir(questionImageDirectory);
  const invalid = names.find(name => !name.startsWith('.') && !questionImageName.test(name));
  if (invalid) throw new Error('Unexpected generated question image filename: ' + invalid + '. Use histology-NNN[-a/b].webp.');
  questionImageFiles = names.filter(name => questionImageName.test(name)).sort();
} catch (error) { if (error.code !== 'ENOENT') throw error; }

let questionImagePackCount = 0;
let questionImageCount = 0;
if (questionImageFiles.length) {
  await rm(questionImagePackDirectory, { recursive: true, force: true });
  await mkdir(questionImagePackDirectory, { recursive: true });
  const index = {};
  let current = {};
  let bytes = 0;
  async function flushQuestionImages() {
    if (!Object.keys(current).length) return;
    const name = 'part-' + String(++questionImagePackCount).padStart(3, '0') + '.js';
    const source = 'export const SCANS = ' + JSON.stringify(current) + ';\n';
    if (Buffer.byteLength(source) > maximumPackBytes) throw new Error('Generated question image module ' + name + ' exceeds ' + maximumPackBytes + ' bytes.');
    for (const filename of Object.keys(current)) index[filename] = name;
    await writeFile(join(questionImagePackDirectory, name), source);
    current = {}; bytes = 0;
  }
  for (const filename of questionImageFiles) {
    const data = await readFile(join(questionImageDirectory, filename));
    const url = 'data:image/webp;base64,' + data.toString('base64');
    const entryBytes = Buffer.byteLength(JSON.stringify(filename) + ':' + JSON.stringify(url) + ',');
    if (entryBytes + 40 > maximumPackBytes) throw new Error('Generated question image ' + filename + ' is too large for a ' + maximumPackBytes + '-byte upload module. Compress the source WebP to about 350 KB before building.');
    if (bytes && bytes + entryBytes + 40 > targetPackBytes) await flushQuestionImages();
    current[filename] = url; bytes += entryBytes; questionImageCount++;
  }
  await flushQuestionImages();
  await writeFile(questionImageIndexPath, '// Lazy generated-question image index generated for GitHub Pages.\nexport const QUESTION_IMAGE_INDEX = ' + JSON.stringify(index) + ';\n');
  await rm(questionImageDirectory, { recursive: true });
} else {
  // Published clones contain the packed modules instead of original WebPs.
  // A source checkout with no generated images uses the nullable default index.
  let source;
  try { source = await readFile(questionImageIndexPath, 'utf8'); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    source = 'export const QUESTION_IMAGE_INDEX = null;\n';
    await writeFile(questionImageIndexPath, source);
  }
  const match = source.match(/export const QUESTION_IMAGE_INDEX = (null|\{[\s\S]*\});/);
  if (!match) throw new Error('The generated question image index must export QUESTION_IMAGE_INDEX as null or an object.');
  const index = JSON.parse(match[1]);
  if (index !== null) {
    const packs = new Set();
    for (const [filename, pack] of Object.entries(index)) {
      if (!questionImageName.test(filename) || !/^part-\d+\.js$/.test(pack)) throw new Error('Invalid generated question image index entry: ' + filename);
      packs.add(pack);
    }
    for (const name of packs) {
      const info = await stat(join(questionImagePackDirectory, name));
      if (!info.isFile() || info.size > maximumPackBytes) throw new Error('Generated question image pack ' + name + ' is missing or exceeds ' + maximumPackBytes + ' bytes.');
    }
    questionImagePackCount = packs.size;
    questionImageCount = Object.keys(index).length;
  }
}

// The editable browser source is already in src/ and data/. Include only the
// small publishing helpers and documentation needed for later chat updates.
for (const name of ['README.md', 'CHAT_UPDATES.md']) {
  await cp(resolve(root, name), resolve(output, name));
}
await writeFile(resolve(output,'package.json'), JSON.stringify({name:'immunote',private:true,type:'module',scripts:{build:'node scripts/build-github-static.mjs'}}, null, 2)+'\n');
await mkdir(resolve(output, 'scripts'), { recursive: true });
for (const name of ['build-pages.mjs', 'build-github-static.mjs', 'import-chat-bundle.mjs']) {
  await cp(resolve(root, 'scripts', name), resolve(output, 'scripts', name));
}
// The working repository owns the full test suite. The published browser package
// does not declare a test command that would require the unpacked original scans.

const manifest = { version: 1, remotePrefix: prefix, scans: scanCount, scanPacks: packCount, questionImages: questionImageCount, questionImagePacks: questionImagePackCount, files: [] };
async function visit(directory) {
  for (const name of (await readdir(directory)).sort()) {
    const path = join(directory, name);
    const info = await stat(path);
    if (info.isDirectory()) { await visit(path); continue; }
    const data = await readFile(path);
    const localPath = relative(output, path).replaceAll('\\', '/');
    const binary = localPath.endsWith('.woff2');
    if (!binary) new TextDecoder('utf-8', { fatal: true }).decode(data);
    manifest.files.push({
      path: prefix + localPath,
      local_path: path,
      encoding: binary ? 'base64' : 'utf-8',
      size_bytes: data.length,
      sha256: createHash('sha256').update(data).digest('hex'),
      git_blob_sha: createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex'),
    });
  }
}
await visit(output);
await writeFile(resolve(root, 'outputs/github-static-upload-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ output, remotePrefix: prefix, scans: scanCount, scanPacks: packCount, questionImages: questionImageCount, questionImagePacks: questionImagePackCount, files: manifest.files.length, maximumScanPackBytes: Math.max(0, ...manifest.files.filter(file => file.path.includes('/scan-packs/')).map(file => file.size_bytes)), maximumQuestionImagePackBytes: Math.max(0, ...manifest.files.filter(file => file.path.includes('/question-image-packs/')).map(file => file.size_bytes)), manifest: 'outputs/github-static-upload-manifest.json' }, null, 2));
