import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'mostre.json');

const LUOGO_VALUES = ['mostra', 'museo', 'mostra-permanente', 'galleria', 'installazione', 'monumento', 'altro'];
const TEMA_VALUES = ['arte', 'scienza', 'fotografia', 'design', 'storia', 'architettura', 'altro'];
const REQUIRED_FIELDS = [
  'id', 'name', 'luogo', 'sede', 'tema', 'abbonamentoLombardia', 'beneFai',
  'descrizioneBreve', 'descrizioneLunga', 'dataInizio', 'dataFine', 'indirizzo', 'sitoWeb', 'fonteUrl',
];

const SYSTEM_PROMPT = `Sei un ricercatore incaricato di mantenere aggiornato un catalogo pubblico di mostre, musei, gallerie e monumenti visitabili a Milano e dintorni (Lombardia). Usa lo strumento di ricerca web per trovare informazioni reali e attuali — non inventare mai date, indirizzi o URL. Se non trovi un dato con certezza, ometti quella voce piuttosto che inventarla.`;

const USER_PROMPT = `Cerca sul web e produci un catalogo di 20-30 mostre, musei, gallerie, installazioni e monumenti visitabili a Milano (o in Lombardia se rilevanti per l'Abbonamento Musei Lombardia), includendo:
- Alcune mostre temporanee attualmente in corso
- Alcune mostre in arrivo nei prossimi mesi (data di inizio futura)
- Le principali collezioni permanenti e musei di Milano (Museo del Novecento, Pinacoteca di Brera, Triennale, Castello Sforzesco, Museo Poldi Pezzoli, Museo Diocesano, Museo Nazionale Scienza e Tecnologia, GAM, Palazzo Reale, Fondazione Prada, ecc.)
- Qualche monumento o bene FAI, se pertinente

Rispondi SOLO con un blocco di codice \`\`\`json contenente un oggetto con questa struttura esatta (nessun testo prima o dopo il blocco):

{
  "exhibits": [
    {
      "id": "slug-univoco-in-minuscolo-con-trattini",
      "name": "Nome ufficiale della mostra/museo",
      "luogo": "uno tra: ${LUOGO_VALUES.join(' | ')}",
      "sede": "Nome del luogo/istituzione ospitante",
      "tema": "uno tra: ${TEMA_VALUES.join(' | ')}",
      "abbonamentoLombardia": true o false,
      "beneFai": true o false,
      "descrizioneBreve": "Massimo 160 caratteri",
      "descrizioneLunga": "250-300 caratteri",
      "dataInizio": "YYYY-MM-DD",
      "dataFine": "YYYY-MM-DD",
      "indirizzo": "Indirizzo completo con CAP e città",
      "sitoWeb": "https://... (sito ufficiale reale)",
      "fonteUrl": "https://... (pagina consultata per queste informazioni)"
    }
  ]
}

Ogni "id" deve essere univoco. Le date devono essere realistiche rispetto a oggi. Verifica ogni fatto con la ricerca web prima di includerlo.`;

async function callClaude() {
  const client = new Anthropic();
  let messages = [{ role: 'user', content: USER_PROMPT }];
  let response;

  for (let attempt = 0; attempt < 6; attempt++) {
    response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20260209', name: 'web_search' }],
      messages,
    });

    if (response.stop_reason !== 'pause_turn') break;
    messages = [...messages, { role: 'assistant', content: response.content }];
  }

  return response;
}

function extractJson(response) {
  const textBlocks = response.content.filter((b) => b.type === 'text');
  if (textBlocks.length === 0) throw new Error('La risposta di Claude non contiene alcun blocco di testo.');

  // Web search responses often include narration text blocks ("Cerco...")
  // before the final block with the JSON — search across all of them, not
  // just the first, and prefer a fenced ```json block over raw braces.
  const combinedText = textBlocks.map((b) => b.text).join('\n');

  const fenced = combinedText.match(/```json\s*([\s\S]*?)```/);
  if (fenced) return JSON.parse(fenced[1]);

  const firstBrace = combinedText.indexOf('{');
  const lastBrace = combinedText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(combinedText.slice(firstBrace, lastBrace + 1));
  }

  throw new Error(`Nessun JSON trovato nella risposta. Testo ricevuto: ${combinedText.slice(0, 500)}`);
}

function validate(data) {
  if (!data || !Array.isArray(data.exhibits)) {
    throw new Error('Il JSON non contiene un array "exhibits".');
  }
  if (data.exhibits.length < 10) {
    throw new Error(`Troppe poche voci: ${data.exhibits.length} (minimo 10).`);
  }

  const seenIds = new Set();
  data.exhibits.forEach((item, i) => {
    for (const field of REQUIRED_FIELDS) {
      if (!(field in item)) throw new Error(`Voce ${i} ("${item.name || '?'}"): manca il campo "${field}".`);
    }
    if (!LUOGO_VALUES.includes(item.luogo)) {
      throw new Error(`Voce ${i} ("${item.name}"): luogo non valido "${item.luogo}".`);
    }
    if (!TEMA_VALUES.includes(item.tema)) {
      throw new Error(`Voce ${i} ("${item.name}"): tema non valido "${item.tema}".`);
    }
    if (typeof item.abbonamentoLombardia !== 'boolean' || typeof item.beneFai !== 'boolean') {
      throw new Error(`Voce ${i} ("${item.name}"): abbonamentoLombardia/beneFai devono essere booleani.`);
    }
    if (Number.isNaN(Date.parse(item.dataInizio)) || Number.isNaN(Date.parse(item.dataFine))) {
      throw new Error(`Voce ${i} ("${item.name}"): date non valide.`);
    }
    if (seenIds.has(item.id)) {
      throw new Error(`Id duplicato: "${item.id}".`);
    }
    seenIds.add(item.id);
  });
}

async function run() {
  const response = await callClaude();
  const data = extractJson(response);
  validate(data);

  data.generatedAt = new Date().toISOString();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n');
  console.log(`Scritte ${data.exhibits.length} voci in ${OUTPUT_PATH}`);
}

run().catch((err) => {
  console.error('Aggiornamento fallito:', err.message);
  process.exit(1);
});
