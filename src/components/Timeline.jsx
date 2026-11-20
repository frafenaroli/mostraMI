import styles from './Timeline.module.css';

// The run of a show as a thin violet bar: filled up to today, with a dot on
// today and the opening/closing dates underneath (closing date emphasised).
export function Timeline({ item, size = 'sm' }) {
  return (
    <span className={`${styles.timeline} ${styles[size]}`}>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.fill} style={{ width: item.progress }} />
        <span className={styles.dot} style={{ left: item.progress }} />
      </span>
      <span className={styles.dates}>
        <span><span className="visually-hidden">Dal </span>{item.startShort}</span>
        <span className={styles.end}><span className="visually-hidden">al </span>{item.endShort}</span>
      </span>
    </span>
  );
}
