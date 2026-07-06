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

// Curated trusted sources — provided by the site owner. Listing exact URLs
// lets Claude fetch them directly (web_fetch only fetches URLs already
// present in the conversation), and restricting web_search to these domains
// avoids burning searches on the open web.
const TRUSTED_SOURCES = `Musei civici del Comune di Milano
- https://www.palazzorealemilano.it
- https://www.museodelnovecento.org
- https://www.gam-milano.com
- https://www.milanocastello.it
- https://www.pacmilano.it
- https://www.mudec.it
- https://www.museoarcheologicomilano.it
- https://www.museorisorgimentomilano.it
- https://www.museostorianaturale.mi.it
- https://www.palazzomorando.it

Fondazioni e istituzioni private
- https://www.fondazioneprada.org
- https://www.hangarbicocca.org
- https://www.triennale.org
- https://www.gallerieditalia.com
- https://www.ambrosiana.it
- https://www.museopolpezzoli.it
- https://www.fondazionerovatimilano.org
- https://www.adidesignmuseum.org
- https://www.museodiocesanomilano.it
- https://www.icamilano.it
- https://www.fondazionestelline.it
- https://www.fabbricadelvapore.org
- https://www.museoscienza.org

Istituzioni statali
- https://www.pinacotecabrera.org

Case museo e collezioni
- https://www.museobagattiivalsecchi.org
- https://fondoambiente.it/luoghi/villa-necchi-campiglio
- https://www.casaboschidestefano.mi.it
- https://www.armanihotels.com/armanisilos

Arte contemporanea e digitale
- https://meet.media

Abbonamenti e portali istituzionali
- https://www.abbonamentomusei.it
- https://www.comune.milano.it/cultura`;

const ALLOWED_DOMAINS = [
  'palazzorealemilano.it', 'museodelnovecento.org', 'gam-milano.com', 'milanocastello.it', 'pacmilano.it',
  'mudec.it', 'museoarcheologicomilano.it', 'museorisorgimentomilano.it', 'museostorianaturale.mi.it', 'palazzomorando.it',
  'fondazioneprada.org', 'hangarbicocca.org', 'triennale.org', 'gallerieditalia.com', 'ambrosiana.it',
  'museopolpezzoli.it', 'fondazionerovatimilano.org', 'adidesignmuseum.org', 'museodiocesanomilano.it', 'icamilano.it',
  'fondazionestelline.it', 'fabbricadelvapore.org', 'museoscienza.org', 'pinacotecabrera.org',
  'museobagattiivalsecchi.org', 'fondoambiente.it', 'casaboschidestefano.mi.it', 'armanihotels.com',
  'meet.media', 'abbonamentomusei.it', 'comune.milano.it',
];

const SYSTEM_PROMPT = `Sei un ricercatore incaricato di mantenere aggiornato un catalogo pubblico di mostre, musei, gallerie e monumenti visitabili a Milano e dintorni (Lombardia). Usa esclusivamente le fonti elencate nel messaggio dell'utente: apri direttamente le pagine con web_fetch e, solo se necessario per trovare la pagina giusta all'interno di un sito, usa web_search limitata a quei domini. Non inventare mai date, indirizzi o URL. Se non trovi un dato con certezza, ometti quella voce piuttosto che inventarla.`;

const USER_PROMPT = `Ecco l'elenco delle fonti ufficiali da consultare (usa web_fetch per aprirle direttamente — sono già elencate qui, quindi puoi recuperarle subito senza cercarle prima):

${TRUSTED_SOURCES}

Non serve controllare tutte le fonti elencate: scegline circa 10-12, dando priorità a un mix di mostre temporanee in corso e ai musei principali, e produci un catalogo di 10-14 voci totali, includendo:
- Alcune mostre temporanee attualmente in corso
- Una o due mostre in arrivo nei prossimi mesi (data di inizio futura), se le trovi facilmente
- Alcune delle principali collezioni permanenti dei musei elencati sopra
- Al massimo un monumento o bene FAI, se pertinente
- Indica abbonamentoLombardia:true solo per i luoghi che risultano nell'elenco su abbonamentomusei.it

Hai un budget totale limitato di chiamate a web_fetch/web_search: usale con parsimonia (una per sito, al massimo due se la prima non basta) e fermati appena hai abbastanza materiale per compilare il catalogo richiesto — non serve essere esaustivi.

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

// Cost & duration guardrails. Claude's server-side tool loop already caps
// around ~10 tool calls per turn before it must pause — a previous run with
// generous per-tool caps (10 searches + 20 fetches) and 2 retries did far
// more real fetching than that in aggregate and ran long enough (~15 min on
// one call) to trip the SDK's request timeout, wasting the whole run. Keep
// combined tool use per turn comfortably under that internal ceiling, and
// use a single attempt (no retry) so cost/duration can't compound. Streaming
// (see callClaude) is the safety net if a turn ever runs long anyway.
const MAX_CONTINUATIONS = 1;
const MAX_SEARCHES = 4;
const MAX_FETCHES = 8;

function logUsage(attempt, usage) {
  console.log(
    `[usage] tentativo ${attempt + 1}: input=${usage.input_tokens} output=${usage.output_tokens} ` +
    `cache_write=${usage.cache_creation_input_tokens ?? 0} cache_read=${usage.cache_read_input_tokens ?? 0}`,
  );
}

async function callClaude() {
  const client = new Anthropic();
  let messages = [{ role: 'user', content: USER_PROMPT }];
  let response;

  for (let attempt = 0; attempt < MAX_CONTINUATIONS; attempt++) {
    // Streaming avoids the client-side request timeout that killed a
    // previous run outright after ~15 minutes of real (but unfinished) work.
    const stream = client.messages.stream({
      model: 'claude-sonnet-5',
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium' },
      system: SYSTEM_PROMPT,
      tools: [
        { type: 'web_search_20260209', name: 'web_search', max_uses: MAX_SEARCHES, allowed_domains: ALLOWED_DOMAINS },
        { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: MAX_FETCHES, allowed_domains: ALLOWED_DOMAINS },
      ],
      messages,
    });
    response = await stream.finalMessage();
    logUsage(attempt, response.usage);

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
