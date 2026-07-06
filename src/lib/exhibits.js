// Data contract: public/mostre.json, published on GitHub Pages and refreshed weekly
// by a separate agent. Shape: { generatedAt, exhibits: [...] }. See README-data.md.

export const LUOGO_LABELS = {
  mostra: 'Mostra',
  museo: 'Museo',
  'mostra-permanente': 'Mostra permanente',
  galleria: 'Galleria',
  installazione: 'Installazione',
  monumento: 'Monumento',
  altro: 'Altro',
};

// Hue components behind LUOGO_COLORS, used to color-code the popup's aura per luogo type.
export const LUOGO_HUES = {
  mostra: 20,
  museo: 40,
  galleria: 300,
  'mostra-permanente': 190,
  installazione: 80,
  monumento: 250,
  altro: 60,
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

// Per-luogo color ramps (oklch), ported 1:1 from the approved design.
export const LUOGO_COLORS = {
  mostra: { solid: 'oklch(50% 0.14 20)', light: 'oklch(94% 0.03 20)', fg: 'oklch(50% 0.14 20)', border: 'oklch(88% 0.05 20)' },
  museo: { solid: 'oklch(46% 0.03 40)', light: 'oklch(94% 0.02 40)', fg: 'oklch(46% 0.03 40)', border: 'oklch(87% 0.02 40)' },
  galleria: { solid: 'oklch(48% 0.12 300)', light: 'oklch(94% 0.025 300)', fg: 'oklch(48% 0.12 300)', border: 'oklch(88% 0.045 300)' },
  'mostra-permanente': { solid: 'oklch(48% 0.1 190)', light: 'oklch(94% 0.025 190)', fg: 'oklch(48% 0.1 190)', border: 'oklch(88% 0.045 190)' },
  installazione: { solid: 'oklch(55% 0.13 80)', light: 'oklch(94% 0.03 80)', fg: 'oklch(50% 0.13 80)', border: 'oklch(88% 0.05 80)' },
  monumento: { solid: 'oklch(48% 0.1 250)', light: 'oklch(94% 0.025 250)', fg: 'oklch(48% 0.1 250)', border: 'oklch(88% 0.045 250)' },
  altro: { solid: 'oklch(45% 0.015 60)', light: 'oklch(93% 0.006 60)', fg: 'oklch(45% 0.015 60)', border: 'oklch(86% 0.008 60)' },
};

// Tema badges are uniformly "lilla" regardless of the specific tema (as approved in the design).
export const TEMA_COLOR = { light: 'oklch(94% 0.025 300)', fg: 'oklch(48% 0.12 300)', border: 'oklch(88% 0.045 300)' };
export const ABBONAMENTO_COLOR = { light: 'oklch(94% 0.03 150)', fg: 'oklch(45% 0.09 150)', border: 'oklch(88% 0.05 150)' };
export const FAI_COLOR = { light: 'oklch(94% 0.03 210)', fg: 'oklch(46% 0.1 210)', border: 'oklch(88% 0.05 210)' };

// Threshold for the "ultimi giorni" badge, in days-until-dataFine.
const ULTIMI_GIORNI_SOGLIA = 14;

// Luoghi that are permanent institutions/collections rather than time-boxed
// shows: their date range (a placeholder like "— 31 dicembre 2099") is not
// meaningful, so we label them "Permanente" and hide the redundant sede name.
const PERMANENT_LUOGHI = new Set(['museo', 'mostra-permanente', 'monumento']);

export function isPermanent(exhibit) {
  return PERMANENT_LUOGHI.has(exhibit.luogo);
}

export function getPeriodo(exhibit, today = new Date()) {
  const start = new Date(exhibit.dataInizio);
  const end = new Date(exhibit.dataFine);
  const msPerDay = 1000 * 60 * 60 * 24;
  if (today < start) return 'in-arrivo';
  const daysUntilEnd = Math.ceil((end - today) / msPerDay);
  if (daysUntilEnd <= ULTIMI_GIORNI_SOGLIA) return 'ultimi-giorni';
  return 'in-corso';
}

export function buildMapsUrl(indirizzo) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(indirizzo)}`;
}

export function formatDateRange(dataInizio, dataFine) {
  const fmt = (d) => new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${fmt(dataInizio)} — ${fmt(dataFine)}`;
}

// Decorates a raw exhibit with derived display data: periodo, tag list, colors.
export function decorateExhibit(exhibit, today = new Date()) {
  const periodo = getPeriodo(exhibit, today);
  const permanent = isPermanent(exhibit);
  const luogoColor = LUOGO_COLORS[exhibit.luogo] || LUOGO_COLORS.altro;
  const tags = [
    { id: 'luogo', label: LUOGO_LABELS[exhibit.luogo] || exhibit.luogo, light: luogoColor.light, fg: luogoColor.fg, border: luogoColor.border },
    { id: 'tema', label: TEMA_LABELS[exhibit.tema] || exhibit.tema, light: TEMA_COLOR.light, fg: TEMA_COLOR.fg, border: TEMA_COLOR.border },
  ];
  if (exhibit.abbonamentoLombardia) {
    tags.push({ id: 'abbonamento', label: 'Abb. Lombardia', light: ABBONAMENTO_COLOR.light, fg: ABBONAMENTO_COLOR.fg, border: ABBONAMENTO_COLOR.border });
  }
  if (exhibit.beneFai) {
    tags.push({ id: 'fai', label: 'Bene FAI', light: FAI_COLOR.light, fg: FAI_COLOR.fg, border: FAI_COLOR.border });
  }
  return {
    ...exhibit,
    periodo,
    isPermanent: permanent,
    isUltimiGiorni: !permanent && periodo === 'ultimi-giorni',
    isInArrivo: !permanent && periodo === 'in-arrivo',
    tags,
    luogoColor,
    mapsUrl: buildMapsUrl(exhibit.indirizzo),
    dateRangeLabel: permanent ? 'Permanente' : formatDateRange(exhibit.dataInizio, exhibit.dataFine),
  };
}

export const SORT_OPTIONS = ['rilevanza', 'alfabetico', 'scadenza'];
export const SORT_LABELS = { rilevanza: 'Rilevanza', alfabetico: 'Alfabetico', scadenza: 'In scadenza' };

const PERIODO_RANK = { 'ultimi-giorni': 0, 'in-corso': 1, 'in-arrivo': 2 };

export function sortExhibits(list, sortKey) {
  if (sortKey === 'alfabetico') return [...list].sort((a, b) => a.name.localeCompare(b.name, 'it'));
  if (sortKey === 'scadenza') return [...list].sort((a, b) => PERIODO_RANK[a.periodo] - PERIODO_RANK[b.periodo]);
  return list;
}

export function matchesFilters(exhibit, filters) {
  const { luogo, temi, abbonamento, fai, periodo } = filters;
  if (luogo !== 'tutti' && exhibit.luogo !== luogo) return false;
  if (temi.length && !temi.includes(exhibit.tema)) return false;
  if (abbonamento && !exhibit.abbonamentoLombardia) return false;
  if (fai && !exhibit.beneFai) return false;
  if (periodo !== 'tutti' && exhibit.periodo !== periodo) return false;
  return true;
}

export const EMPTY_FILTERS = { luogo: 'tutti', temi: [], abbonamento: false, fai: false, periodo: 'tutti' };

export function countActiveFilters(filters) {
  return (
    filters.temi.length +
    (filters.abbonamento ? 1 : 0) +
    (filters.fai ? 1 : 0) +
    (filters.periodo !== 'tutti' ? 1 : 0) +
    (filters.luogo !== 'tutti' ? 1 : 0)
  );
}

export function matchesQuery(exhibit, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    exhibit.name.toLowerCase().includes(q) ||
    exhibit.tema.toLowerCase().includes(q) ||
    exhibit.sede.toLowerCase().includes(q) ||
    LUOGO_LABELS[exhibit.luogo].toLowerCase().includes(q)
  );
}
