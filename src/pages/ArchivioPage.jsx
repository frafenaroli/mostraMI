import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useExhibitsData } from '../lib/ExhibitsContext';
import { PageShell } from '../components/PageShell';
import { IconButton } from '../components/IconButton';
import { ListToolbar } from '../components/ListToolbar';
import { ResultsList } from '../components/ResultsList';
import { FilterSheet } from '../components/FilterSheet';
import { EmptyState } from '../components/EmptyState';
import { Pill } from '../components/Pill';
import { EMPTY_FILTERS, matchesFilters, sortExhibits, countActiveFilters } from '../lib/exhibits';
import styles from './ArchivioPage.module.css';

const PAGE_SIZE = 6;

function filtersFromParams(params) {
  const filters = { ...EMPTY_FILTERS };
  if (params.get('luogo')) filters.luogo = params.get('luogo');
  if (params.get('periodo')) filters.periodo = params.get('periodo');
  if (params.get('abbonamento')) filters.abbonamento = true;
  if (params.get('fai')) filters.fai = true;
  if (params.get('tema')) filters.temi = params.get('tema').split(',');
  return filters;
}

export default function ArchivioPage() {
  const { status, exhibits } = useExhibitsData();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));
  const [sort, setSort] = useState('rilevanza');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => sortExhibits(exhibits.filter((e) => matchesFilters(e, filters)), sort),
    [exhibits, filters, sort],
  );
  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const activeFilterCount = countActiveFilters(filters);

  function handleFiltersChange(next) {
    setFilters(next);
    setVisibleCount(PAGE_SIZE);
  }
  function handleClear() {
    setFilters(EMPTY_FILTERS);
    setVisibleCount(PAGE_SIZE);
  }

  if (status === 'loading') return null;

  return (
    <PageShell>
      <div className={styles.topRow}>
        <IconButton icon="back" to="/" label="Torna alla home" glass={false} />
        <div className={styles.title}>Tutte le mostre</div>
      </div>

      <ListToolbar
        countLabel={`${filtered.length} risultati`}
        sort={sort}
        onCycleSort={setSort}
        activeFilterCount={activeFilterCount}
        onToggleFilters={() => setSheetOpen(true)}
      />

      {visible.length > 0 && <ResultsList items={visible} />}

      {hasMore && (
        <div className={styles.loadMoreRow}>
          <Pill variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>Mostrami di più</Pill>
        </div>
      )}

      {filtered.length === 0 && (
        <EmptyState iconName="search" title="Nessun risultato con questi filtri" desc="Prova a rimuovere qualche filtro attivo per vedere più mostre.">
          <Pill variant="outline" small onClick={handleClear}>Cancella filtri</Pill>
          <Pill as={Link} to="/" variant="primary" small>Portami in home</Pill>
        </EmptyState>
      )}

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onChange={handleFiltersChange}
        onClear={handleClear}
        resultsCount={filtered.length}
      />
    </PageShell>
  );
}
