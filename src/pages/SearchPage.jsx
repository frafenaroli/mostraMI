import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useExhibitsData } from '../lib/ExhibitsContext';
import { PageShell } from '../components/PageShell';
import { IconButton } from '../components/IconButton';
import { ListToolbar } from '../components/ListToolbar';
import { ResultsList } from '../components/ResultsList';
import { FilterSheet } from '../components/FilterSheet';
import { EmptyState } from '../components/EmptyState';
import { Pill } from '../components/Pill';
import { Icon } from '../icons/Icon';
import { EMPTY_FILTERS, matchesFilters, matchesQuery, sortExhibits, countActiveFilters } from '../lib/exhibits';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const { status, exhibits } = useExhibitsData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('rilevanza');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (query) next.set('q', query);
      else next.delete('q');
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const results = useMemo(
    () => sortExhibits(exhibits.filter((e) => matchesQuery(e, query) && matchesFilters(e, filters)), sort),
    [exhibits, query, filters, sort],
  );
  const activeFilterCount = countActiveFilters(filters);

  if (status === 'loading') return null;

  const isEmpty = results.length === 0;
  const emptyTitle = query
    ? `Nessun risultato per "${query}"${activeFilterCount ? ' con questi filtri' : ''}`
    : 'Nessun risultato con questi filtri';
  const emptyDesc = activeFilterCount
    ? 'Prova a rimuovere qualche filtro attivo per vedere più risultati.'
    : 'Prova con un altro termine, oppure esplora tutte le mostre disponibili.';

  return (
    <PageShell>
      <div className={styles.topRow}>
        <IconButton icon="back" to="/" label="Torna alla home" glass={false} />
        <div className={styles.inputRow}>
          <Icon name="search" size={15} color="oklch(46% 0.015 40)" />
          <input
            className={styles.input}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca luogo, artista, keyword…"
            aria-label="Cerca mostre, musei o gallerie"
            autoFocus
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')} aria-label="Cancella ricerca">
              <Icon name="close" size={13} color="var(--color-icon-quiet)" />
            </button>
          )}
        </div>
      </div>

      <ListToolbar
        countLabel={query ? `${results.length} risultati per "${query}"` : `${results.length} risultati`}
        sort={sort}
        onCycleSort={setSort}
        activeFilterCount={activeFilterCount}
        onToggleFilters={() => setSheetOpen(true)}
      />

      {!isEmpty && <ResultsList items={results} />}

      {isEmpty && (
        <EmptyState iconName="searchX" title={emptyTitle} desc={emptyDesc}>
          {(activeFilterCount > 0 || query) && (
            <Pill variant="outline" small onClick={() => { setFilters(EMPTY_FILTERS); setQuery(''); }}>Cancella ricerca</Pill>
          )}
          <Pill as={Link} to="/" variant="primary" small>Portami in home</Pill>
        </EmptyState>
      )}

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
        resultsCount={results.length}
      />
    </PageShell>
  );
}
