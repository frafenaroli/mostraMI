import styles from './ListToolbar.module.css';
import { Icon } from '../icons/Icon';
import { SORT_OPTIONS, SORT_LABELS } from '../lib/exhibits';

export function ListToolbar({ countLabel, sort, onCycleSort, activeFilterCount, onToggleFilters }) {
  const filtriStyle = {
    borderColor: activeFilterCount ? 'oklch(88% 0.05 20)' : 'oklch(88% 0.008 60)',
    background: activeFilterCount ? 'oklch(94% 0.03 20)' : 'oklch(99% 0 0)',
    color: activeFilterCount ? 'oklch(50% 0.14 20)' : 'oklch(40% 0.02 40)',
  };

  function cycleSort() {
    const i = SORT_OPTIONS.indexOf(sort);
    onCycleSort(SORT_OPTIONS[(i + 1) % SORT_OPTIONS.length]);
  }

  return (
    <div className={styles.bar}>
      <div className={styles.count}>{countLabel}</div>
      <div className={styles.actions}>
        <button className={styles.sortBtn} onClick={cycleSort}>
          Ordina: {SORT_LABELS[sort]}
          <Icon name="chevronDown" size={12} />
        </button>
        <button className={styles.filtriBtn} style={filtriStyle} onClick={onToggleFilters}>
          <Icon name="filter" size={13} />
          Filtri
          {activeFilterCount > 0 && <span className={styles.filtriBadge}>{activeFilterCount}</span>}
        </button>
      </div>
    </div>
  );
}
