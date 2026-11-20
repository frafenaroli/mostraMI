import styles from './Rows.module.css';
import { ExhibitLink } from './ExhibitLink';
import { Timeline } from './Timeline';
import { DateBlock } from './DateBlock';
import { AbbTag } from './AbbTag';
import { statusLabel, runMeta } from '../lib/exhibits';

// Row with the run timeline. `kicker` puts "sede · tema" above the title (home);
// otherwise the sede sits under it (calendar).
export function TimelineRow({ item, kicker = false, showAbb = false, large = false }) {
  const status = item.isInArrivo || item.isUrgent ? statusLabel(item) : null;
  return (
    <ExhibitLink id={item.id} className={styles.row}>
      {kicker && <span className={styles.meta}>{item.sede} · {item.temaLabel}</span>}
      <span className={large ? styles.titleLg : styles.title}>{item.name}</span>
      {!kicker && <span className={styles.meta}>{item.sede}</span>}
      {showAbb && item.abbonamentoLombardia && <AbbTag />}
      <span className={styles.timelineWrap}>
        <Timeline item={item} />
      </span>
      {status && <span className={item.isUrgent ? styles.urgent : styles.meta}>{status}</span>}
    </ExhibitLink>
  );
}

// Row led by a date block (opening date). `meta` adds the small-caps run line.
export function DateRow({ item, sub, meta = false, showAbb = true }) {
  return (
    <ExhibitLink id={item.id} className={`${styles.row} ${styles.dateRow}`}>
      <DateBlock date={item.start} />
      <span className={styles.col}>
        <span className={styles.title}>{item.name}</span>
        <span className={styles.meta}>{sub ?? item.sede}</span>
        {meta && <span className={styles.smallCaps}>{runMeta(item)}</span>}
        {showAbb && item.abbonamentoLombardia && <AbbTag />}
      </span>
    </ExhibitLink>
  );
}

// Plain row for places that are always open.
export function PlaceRow({ item }) {
  return (
    <ExhibitLink id={item.id} className={styles.row}>
      <span className={styles.title}>{item.name}</span>
      <span className={styles.meta}>{item.sede !== item.name ? `${item.sede} · ` : ''}{item.luogoLabel}</span>
      {item.abbonamentoLombardia && <AbbTag />}
    </ExhibitLink>
  );
}
