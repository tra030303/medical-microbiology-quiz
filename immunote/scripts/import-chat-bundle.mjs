import { readFile, writeFile, rename } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { parseImport, validateQuestion } from '../src/importer.js';
import { CATEGORIES } from '../data/categories.js';

const root = resolve(import.meta.dirname, '..');
const modulePath = resolve(root, 'data/chat-questions.js');
const prefix = '// Chat-uploaded questions validated before publication.\nexport const CHAT_QUESTIONS = ';
const normalized = value => String(value || '').replace(/\s/g, '');

export async function importChatBundle({ inputPath, bank, allowUnconfirmed = false, replaceExisting = false, dryRun = false }) {
  if (!['past', 'generated'].includes(bank)) throw new Error('An explicit --bank past or --bank generated is required.');
  if (!['.json', '.txt', '.md', '.markdown', '.csv'].includes(extname(inputPath).toLowerCase())) throw new Error('Use a JSON, TXT, Markdown, or CSV question bundle.');
  const raw = await readFile(inputPath, 'utf8');
  const parsed = parseImport(raw, { filename: inputPath });
  if (!parsed.questions.length) throw new Error(parsed.warnings.join('\n') || 'No questions were found.');
  const dangerousWarnings = parsed.warnings.filter(message => !(allowUnconfirmed && bank === 'past' && /정답이 없습니다/.test(message)));
  if (dangerousWarnings.length) throw new Error('Resolve all import warnings before publication:\n' + dangerousWarnings.join('\n'));

  let existing = [];
  try {
    const saved = await readFile(modulePath, 'utf8');
    const match = saved.match(/^\s*(?:\/\/[^\n]*\n\s*)*export const CHAT_QUESTIONS = (\[[\s\S]*\]);\s*$/);
    if (!match) throw new Error('The existing chat question module has an unfamiliar format.');
    existing = JSON.parse(match[1]);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (!Array.isArray(existing)) throw new Error('The saved chat question bank must be an array.');
  const byId = new Map(existing.map(q => [q.id, q]));
  let added = 0, updated = 0, duplicates = 0;
  const accepted = [];
  for (const [index, question] of parsed.questions.entries()) {
    const row = index + 1;
    if (question.bank && question.bank !== bank) throw new Error(`Question ${row}: the supplied bank conflicts with --bank ${bank}.`);
    if (question.id && !/^chat-(past|generated)-[a-f0-9]{16}$/.test(question.id)) throw new Error(`Question ${row}: existing seed/past IDs and arbitrary IDs cannot be overwritten. Omit id for a new question.`);
    if (question.id && !question.id.startsWith('chat-' + bank + '-')) throw new Error(`Question ${row}: ID belongs to another bank.`);
    const category = CATEGORIES.find(c => c.id === question.category || normalized(c.name) === normalized(question.category));
    if (!category) throw new Error(`Question ${row}: select an existing past-exam category.`);
    if ((question.answer === null || question.answer === undefined) && !(bank === 'past' && allowUnconfirmed && question.source.trim())) {
      throw new Error(`Question ${row}: a missing answer is allowed only for explicitly unconfirmed past questions with a source.`);
    }
    const valid = validateQuestion(question, { allowUnanswered: bank === 'past' && allowUnconfirmed });
    if (!valid.valid) throw new Error(`Question ${row}: ${valid.errors.join(' ')}`);
    const signature = JSON.stringify([bank, category.id, question.stem, question.options]);
    const id = question.id || 'chat-' + bank + '-' + createHash('sha256').update(signature).digest('hex').slice(0, 16);
    const entry = { ...question, id, bank, category: category.id };
    if (entry.answer === null) entry.answerStatus = 'unconfirmed';
    const previous = byId.get(id);
    if (previous) {
      if (JSON.stringify(previous) === JSON.stringify(entry)) { duplicates++; continue; }
      if (!replaceExisting) throw new Error(`Question ${row}: changing an existing chat question requires --replace-existing. Original seed/past questions remain protected.`);
      if (previous.bank !== bank) throw new Error(`Question ${row}: an existing question cannot move between banks.`);
      updated++;
    } else added++;
    byId.set(id, entry);
    accepted.push(id);
  }
  if (!dryRun) {
    const output = prefix + JSON.stringify([...byId.values()], null, 2) + ';\n';
    const temporary = modulePath + '.tmp';
    await writeFile(temporary, output, 'utf8');
    await rename(temporary, modulePath);
  }
  return { bank, added, updated, duplicates, total: byId.size, dryRun, acceptedIds: accepted, warnings: parsed.warnings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const inputPath = args.shift();
  const bankIndex = args.indexOf('--bank');
  const bank = bankIndex === -1 ? undefined : args[bankIndex + 1];
  const known = new Set(['--bank', 'past', 'generated', '--allow-unconfirmed', '--replace-existing', '--dry-run']);
  if (!inputPath || args.some(argument => !known.has(argument))) throw new Error('Usage: node scripts/import-chat-bundle.mjs <file> --bank past|generated [--allow-unconfirmed] [--replace-existing] [--dry-run]');
  console.log(JSON.stringify(await importChatBundle({ inputPath: resolve(inputPath), bank, allowUnconfirmed: args.includes('--allow-unconfirmed'), replaceExisting: args.includes('--replace-existing'), dryRun: args.includes('--dry-run') }), null, 2));
}
