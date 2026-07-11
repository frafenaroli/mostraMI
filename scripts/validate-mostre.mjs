// Validates public/mostre.json against the data contract used by the app.
// Exit code 1 on any structural error (so CI blocks a broken publish);
// stale-content issues (ended shows, low count) are printed as warnings only.
//
// Run with: npm run validate
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LUOGO_LABELS, TEMA_LABELS } from '../src/lib/exhibits.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_PATH = join(ROOT, 'public', 'mostre.json');

const LUOGO = Object.keys(LUOGO_LABELS);
const TEMA = Object.keys(TEMA_LABELS);
const REQUIRED = [
  'id', 'name', 'luogo', 'sede', 'tema', 'abbonamentoLombardia', 'beneFai',
  'descrizioneBreve', 'descrizioneLunga', 'dataInizio', 'dataFine',
  'indirizzo', 'sitoWeb', 'fonteUrl',
];
const MIN_ENTRIES = 70;

const errors = [];
const warnings = [];

let data;
try {
  data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
} catch (e) {
  console.error(`✗ public/mostre.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

if (!Array.isArray(data.exhibits)) {
  console.error('✗ "exhibits" must be an array.');
  process.exit(1);
}
if (typeof data.generatedAt !== 'string' || Number.isNaN(Date.parse(data.generatedAt))) {
  errors.push('"generatedAt" must be an ISO date string.');
}

const today = new Date();
const ids = new Set();
const isPermanent = (e) => ['museo', 'mostra-permanente', 'monumento'].includes(e.luogo)
  || new Date(e.dataFine).getUTCFullYear() >= 2099;

for (const [i, e] of data.exhibits.entries()) {
  const at = `exhibits[${i}]${e && e.id ? ` (${e.id})` : ''}`;
  for (const f of REQUIRED) {
    if (e[f] === undefined || e[f] === null || e[f] === '') errors.push(`${at}: missing "${f}".`);
  }
  if (e.id) {
    if (ids.has(e.id)) errors.push(`${at}: duplicate id.`);
    ids.add(e.id);
  }
  if (e.luogo && !LUOGO.includes(e.luogo)) errors.push(`${at}: invalid luogo "${e.luogo}".`);
  if (e.tema && !TEMA.includes(e.tema)) errors.push(`${at}: invalid tema "${e.tema}".`);
  if (typeof e.abbonamentoLombardia !== 'boolean') errors.push(`${at}: abbonamentoLombardia must be true/false.`);
  if (typeof e.beneFai !== 'boolean') errors.push(`${at}: beneFai must be true/false.`);
  const start = new Date(e.dataInizio);
  const end = new Date(e.dataFine);
  if (Number.isNaN(start.getTime())) errors.push(`${at}: dataInizio is not a valid date.`);
  if (Number.isNaN(end.getTime())) errors.push(`${at}: dataFine is not a valid date.`);
  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start >= end) {
    errors.push(`${at}: dataInizio must be before dataFine.`);
  }
  // Stale content -> warning, not a hard failure.
  if (!Number.isNaN(end.getTime()) && !isPermanent(e) && end < today) {
    warnings.push(`${at}: exhibition ended on ${e.dataFine} — consider pruning.`);
  }
}

if (data.exhibits.length < MIN_ENTRIES) {
  warnings.push(`only ${data.exhibits.length} entries (target is at least ${MIN_ENTRIES}).`);
}

for (const w of warnings) console.warn(`⚠ ${w}`);

if (errors.length) {
  for (const err of errors) console.error(`✗ ${err}`);
  console.error(`\n✗ mostre.json validation failed: ${errors.length} error(s).`);
  process.exit(1);
}

console.log(`✓ mostre.json is valid — ${data.exhibits.length} entries${warnings.length ? `, ${warnings.length} warning(s)` : ''}.`);
