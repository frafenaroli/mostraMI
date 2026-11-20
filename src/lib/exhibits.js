// Data contract: public/mostre.json, published on GitHub Pages and refreshed on
// demand via the /update-mostre skill. Shape: { generatedAt, exhibits: [...] }.
// Valid `luogo`/`tema` values are the keys of LUOGO_LABELS / TEMA_LABELS below
// (also enforced by scripts/validate-mostre.mjs).

export const LUOGO_LABELS = {
  mostra: 'Mostra',
  museo: 'Museo',
  'mostra-permanente': 'Mostra permanente',
  galleria: 'Galleria',
  installazione: 'Installazione',
  monumento: 'Monumento',
  altro: 'Altro',
};

export const TEMA_LABELS = {
  arte: 'Arte',
  scienza: 'Scienza',
  fotografia: 'Fotografia',
  design: 'Design',
  storia: 'Storia',
  architettura: 'Architettura',
  altro: 'Altro',
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Threshold for the "Chiude tra N giorni" urgency line, in days-until-dataFine.
const ULTIMI_GIORNI_SOGLIA = 14;

// "Aperte da poco" in the calendar's opening-date view.
const APERTE_DA_POCO_GIORNI = 31;

export const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const MESI_BREVI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const GIORNI_BREVI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];

// Dates in mostre.json are plain YYYY-MM-DD days: parse them at local midnight
// so day counts don't drift by the UTC offset.
export function parseDay(value) {
  const [y, m, d] = String(value).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfToday(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysBetween(from, to) {
  return Math.round((to - from) / MS_PER_DAY);
}

// "gen 29": the compact date used under the timeline bars.
export function formatShort(date) {
  return `${MESI_BREVI[date.getMonth()]} ${date.getDate()}`;
}

export function formatLong(date) {
  return `${date.getDate()} ${MESI[date.getMonth()]} ${date.getFullYear()}`;
}

export function dateParts(date) {
  return { mon: MESI_BREVI[date.getMonth()], day: String(date.getDate()), dow: GIORNI_BREVI[date.getDay()] };
}

// Luoghi that are permanent institutions/collections rather than time-boxed
// shows: their date range is not meaningful, so they go under "Sempre aperti".
const PERMANENT_LUOGHI = new Set(['museo', 'mostra-permanente', 'monumento']);

// An entry is "permanent" when its luogo is an institution type, or when its
// dataFine uses the far-future placeholder (e.g. a permanent installation that
// still carries a real opening date, like Kiefer's Sette Palazzi Celesti).
export function isPermanent(exhibit) {
  if (PERMANENT_LUOGHI.has(exhibit.luogo)) return true;
  return parseDay(exhibit.dataFine).getFullYear() >= 2099;
}

// Search Google Maps by venue name + address (not the bare street address),
// so it resolves to the actual place/POI instead of a point on the street.
export function buildMapsUrl(sede, indirizzo) {
  const query = [sede, indirizzo].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Decorates a raw exhibit with derived display data: status, day counts and
// the position of today along its run (for the timeline bar).
export function decorateExhibit(exhibit, today = startOfToday()) {
  const start = parseDay(exhibit.dataInizio);
  const end = parseDay(exhibit.dataFine);
  const permanent = isPermanent(exhibit);
  const daysToStart = daysBetween(today, start);
  const daysToEnd = daysBetween(today, end);

  let periodo = 'in-corso';
  if (daysToEnd < 0) periodo = 'concluse';
  else if (daysToStart > 0) periodo = 'in-arrivo';

  const span = Math.max(1, end - start);
  const pct = Math.max(0, Math.min(100, ((today - start) / span) * 100));

  return {
    ...exhibit,
    start,
    end,
    periodo,
    isPermanent: permanent,
    isInArrivo: !permanent && periodo === 'in-arrivo',
    isAperta: permanent || periodo === 'in-corso',
    daysToStart,
    daysToEnd,
    isUrgent: !permanent && periodo === 'in-corso' && daysToEnd <= ULTIMI_GIORNI_SOGLIA,
    progress: `${pct.toFixed(1)}%`,
    startShort: formatShort(start),
    endShort: formatShort(end),
    luogoLabel: LUOGO_LABELS[exhibit.luogo] || exhibit.luogo,
    temaLabel: TEMA_LABELS[exhibit.tema] || exhibit.tema,
    mapsUrl: buildMapsUrl(exhibit.sede, exhibit.indirizzo),
  };
}

function giorni(n) {
  return n === 1 ? '1 giorno' : `${n} giorni`;
}

export function pluralize(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}

// One-line status, e.g. "Chiude tra 7 giorni", "Apre domani".
export function statusLabel(e) {
  if (e.isPermanent) return 'Sempre aperto';
  if (e.isInArrivo) return e.daysToStart === 1 ? 'Apre domani' : `Apre tra ${giorni(e.daysToStart)}`;
  if (e.daysToEnd === 0) return 'Chiude oggi';
  if (e.daysToEnd === 1) return 'Chiude domani';
  return `Chiude tra ${giorni(e.daysToEnd)}`;
}

// Small-caps meta line for the date-block rows: "tra 3 giorni · fino a mar 1".
export function runMeta(e) {
  if (e.isPermanent) return 'sempre aperto';
  if (e.isInArrivo) return `tra ${giorni(e.daysToStart)} · fino a ${e.endShort}`;
  return `fino a ${e.endShort}`;
}

export function byEnd(a, b) {
  return a.end - b.end || a.name.localeCompare(b.name, 'it');
}

export function byStart(a, b) {
  return a.start - b.start || a.name.localeCompare(b.name, 'it');
}

export function byName(a, b) {
  return a.name.localeCompare(b.name, 'it');
}

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function matchesQuery(exhibit, query) {
  const q = stripAccents(query.trim().toLowerCase());
  if (!q) return true;
  return [exhibit.name, exhibit.sede, exhibit.temaLabel, exhibit.luogoLabel]
    .some((field) => stripAccents(field.toLowerCase()).includes(q));
}

// --- Calendario ---------------------------------------------------------------

export const ORDINI = ['chiusura', 'apertura', 'az'];
export const ORDINE_LABELS = { chiusura: 'Chiusura', apertura: 'Apertura', az: 'A–Z' };
const ORDINE_DESC = { chiusura: 'in ordine di chiusura', apertura: 'prima le ultime inaugurate, poi le prossime aperture', az: 'in ordine alfabetico' };

export const TIPI = ['mostre', 'sempre-aperti'];
export const TIPO_LABELS = { mostre: 'mostre', 'sempre-aperti': 'sempre aperti' };

export function matchesFilters(exhibit, { tipo, tema, abbonamento, fai }) {
  if ((tipo === 'sempre-aperti') !== exhibit.isPermanent) return false;
  if (tema && exhibit.tema !== tema) return false;
  if (abbonamento && !exhibit.abbonamentoLombardia) return false;
  if (fai && !exhibit.beneFai) return false;
  return true;
}

function monthLabel(date, today) {
  const month = MESI[date.getMonth()];
  // Past the current month next year, the bare month name would be ambiguous.
  const farAhead = date.getFullYear() > today.getFullYear() && date.getMonth() >= today.getMonth();
  return farAhead ? `${month} ${date.getFullYear()}` : month;
}

function monthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function initialOf(name) {
  const c = stripAccents(name.trim().charAt(0)).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
}

// Sorts a list for the calendar and tags each item with its group. Returns the
// flat ordered list plus group metadata (label, total count), so the page can
// paginate the flat list and still show each group's full count.
export function calendarOrder(list, ordine, tipo, today = startOfToday()) {
  if (tipo === 'sempre-aperti' || ordine === 'az') {
    const items = [...list].sort(byName).map((e) => ({ e, group: initialOf(e.name) }));
    return withGroups(items, (key) => ({ label: key, big: true }), (n) => String(n));
  }

  if (ordine === 'apertura') {
    const recent = list
      .filter((e) => !e.isInArrivo && -e.daysToStart <= APERTE_DA_POCO_GIORNI)
      .sort((a, b) => b.start - a.start);
    const upcoming = list.filter((e) => e.isInArrivo).sort(byStart);
    const older = list
      .filter((e) => !e.isInArrivo && -e.daysToStart > APERTE_DA_POCO_GIORNI)
      .sort((a, b) => b.start - a.start);
    const items = [
      ...recent.map((e) => ({ e, group: 'recenti' })),
      ...upcoming.map((e) => ({ e, group: `apre-${monthKey(e.start)}` })),
      ...older.map((e) => ({ e, group: 'meno-recenti' })),
    ];
    return withGroups(items, (key, first) => {
      if (key === 'recenti') return { label: 'Aperte da poco' };
      if (key === 'meno-recenti') return { label: 'Aperte da più tempo' };
      return { label: `Aprono a ${monthLabel(first.start, today)}` };
    });
  }

  const items = [...list].sort(byEnd).map((e) => ({ e, group: monthKey(e.end) }));
  return withGroups(items, (key, first) => ({ label: `Chiudono a ${monthLabel(first.end, today)}` }));
}

function withGroups(items, describe, countLabel = (n) => pluralize(n, 'mostra', 'mostre')) {
  const groups = new Map();
  for (const { e, group } of items) {
    if (!groups.has(group)) groups.set(group, { key: group, ...describe(group, e), total: 0 });
    groups.get(group).total += 1;
  }
  for (const g of groups.values()) g.count = countLabel(g.total);
  return { items, groups };
}

// Splits the (already paginated) flat list back into its groups, in order.
export function groupVisible(items, groups) {
  const out = [];
  for (const { e, group } of items) {
    let last = out[out.length - 1];
    if (!last || last.key !== group) {
      last = { ...groups.get(group), items: [] };
      out.push(last);
    }
    last.items.push(e);
  }
  return out;
}

export function calendarSubtitle({ count, tipo, ordine, tema, abbonamento, fai, query }) {
  const permanent = tipo === 'sempre-aperti';
  let subject = permanent ? pluralize(count, 'luogo sempre aperto', 'luoghi sempre aperti') : pluralize(count, 'mostra a tempo', 'mostre a tempo');
  if (abbonamento) subject = permanent
    ? pluralize(count, 'luogo incluso', 'luoghi inclusi') + ' nell’Abbonamento Musei'
    : pluralize(count, 'mostra inclusa', 'mostre incluse') + ' nell’Abbonamento Musei';
  const extra = [];
  if (tema) extra.push(`tema ${TEMA_LABELS[tema].toLowerCase()}`);
  if (fai) extra.push('Bene FAI');
  if (query) extra.push(`per “${query}”`);
  const order = permanent ? ORDINE_DESC.az : ORDINE_DESC[ordine];
  return [subject, ...extra].join(', ') + `, ${order}`;
}
