import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useExhibitsData } from '../lib/ExhibitsContext';
import { PageShell } from '../components/PageShell';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Chip, ChipRow, ChipSelect } from '../components/Chip';
import { TimelineRow, DateRow, PlaceRow } from '../components/Rows';
import { Icon } from '../icons/Icon';
import {
  ORDINI, ORDINE_LABELS, TIPI, TIPO_LABELS, TEMA_LABELS,
  matchesFilters, matchesQuery, calendarOrder, groupVisible, calendarSubtitle, pluralize,
} from '../lib/exhibits';
import styles from './ArchivioPage.module.css';

const PAGE_SIZE = 12;
const TEMA_OPTIONS = Object.entries(TEMA_LABELS).map(([value, label]) => ({ value, label }));

// All calendar state lives in the URL (?ordine, ?tipo, ?tema, ?abbonamento,
// ?fai, ?q), so home shortcuts can deep-link and "back" restores the view.
function readParams(params) {
  const ordine = params.get('ordine');
  const tipo = params.get('tipo');
  const tema = params.get('tema');
  return {
    ordine: ORDINI.includes(ordine) ? ordine : 'chiusura',
    tipo: TIPI.includes(tipo) ? tipo : 'mostre',
    tema: tema && TEMA_LABELS[tema] ? tema : '',
    abbonamento: params.has('abbonamento'),
    fai: params.has('fai'),
    query: params.get('q') || '',
  };
}

export default function ArchivioPage() {
  const { status, exhibits } = useExhibitsData();
  const [params, setParams] = useSearchParams();
  const state = readParams(params);
  const { ordine, tipo, query } = state;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  function update(changes) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(changes)) {
        if (value === '' || value === false || value == null) next.delete(key);
        else next.set(key, value === true ? '1' : value);
      }
      return next;
    }, { replace: true });
    setVisibleCount(PAGE_SIZE);
  }

  const { list, otherTipoMatches } = useMemo(() => {
    const queried = exhibits.filter((e) => matchesQuery(e, query));
    const otherTipo = tipo === 'mostre' ? 'sempre-aperti' : 'mostre';
    return {
      list: queried.filter((e) => matchesFilters(e, state)),
      otherTipoMatches: query ? queried.filter((e) => matchesFilters(e, { ...state, tipo: otherTipo })).length : 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exhibits, params]);

  const { items, groups } = useMemo(() => calendarOrder(list, ordine, tipo), [list, ordine, tipo]);
  const visibleGroups = groupVisible(items.slice(0, visibleCount), groups);
  const remaining = items.length - visibleCount;
  const permanentView = tipo === 'sempre-aperti';

  if (status === 'loading') return null;

  return (
    <PageShell>
      <Header back={{ to: '/', label: 'Torna alla home' }} current="calendario" />

      <section className={styles.intro}>
        <h1 className={styles.title}>Calendario</h1>
        <p className={styles.subtitle} aria-live="polite">{calendarSubtitle({ count: list.length, ...state })}</p>
      </section>

      <div className={styles.controls}>
        <label htmlFor="cal-q" className="visually-hidden">Cerca nel calendario</label>
        <div className={styles.inputBox}>
          <Icon name="search" size={16} />
          <input
            id="cal-q"
            type="search"
            className={styles.input}
            value={query}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Artista, mostra o luogo"
            enterKeyHint="search"
          />
          {query && (
            <button type="button" className={styles.clear} onClick={() => update({ q: '' })} aria-label="Cancella ricerca">
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        {!permanentView && (
          <div className={styles.segmented} role="group" aria-label="Ordina per">
            <span className={styles.indicator} style={{ '--i': ORDINI.indexOf(ordine) }} aria-hidden="true" />
            {ORDINI.map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={ordine === o}
                className={styles.segment}
                onClick={() => update({ ordine: o === 'chiusura' ? '' : o })}
              >
                {ORDINE_LABELS[o]}
              </button>
            ))}
          </div>
        )}

        <ChipRow label="Filtri">
          <Chip onClick={() => update({ tipo: permanentView ? '' : 'sempre-aperti' })} aria-label={`Tipo: ${TIPO_LABELS[tipo]}. Cambia tipo`}>
            Tipo: {TIPO_LABELS[tipo]}
          </Chip>
          <ChipSelect label="Tema" value={state.tema} options={TEMA_OPTIONS} onChange={(v) => update({ tema: v })} />
          <Chip pressed={state.abbonamento} onClick={() => update({ abbonamento: !state.abbonamento })}>Abbonamento Musei</Chip>
          <Chip pressed={state.fai} onClick={() => update({ fai: !state.fai })}>Bene FAI</Chip>
        </ChipRow>
      </div>

      {visibleGroups.map((g) => (
        <section key={g.key} className={styles.group} aria-labelledby={`g-${g.key}`}>
          <h2 className={styles.groupHead} id={`g-${g.key}`}>
            <span className={g.big ? styles.letter : undefined}>{g.label}</span>
            <span className={styles.count}>{g.count}</span>
          </h2>
          {g.items.map((item) => {
            if (permanentView) return <PlaceRow key={item.id} item={item} />;
            if (ordine === 'apertura') return <DateRow key={item.id} item={item} meta />;
            return <TimelineRow key={item.id} item={item} showAbb={ordine === 'az'} />;
          })}
        </section>
      ))}

      {list.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Nessun risultato</p>
          <p className={styles.emptyText}>Prova a togliere qualche filtro o a cercare un'altra parola.</p>
        </div>
      )}

      {otherTipoMatches > 0 && (
        <div className={styles.crossLink}>
          <button type="button" onClick={() => update({ tipo: permanentView ? '' : 'sempre-aperti' })}>
            {pluralize(otherTipoMatches, 'risultato', 'risultati')} anche tra {permanentView ? 'le mostre a tempo' : 'i luoghi sempre aperti'}
          </button>
        </div>
      )}

      <div className={styles.more}>
        {remaining > 0 && (
          <Button compact onClick={() => setVisibleCount(items.length)}>
            {remaining === 1 ? 'Mostrami l’ultima' : `Mostrami le altre ${remaining}`}
          </Button>
        )}
      </div>
    </PageShell>
  );
}
