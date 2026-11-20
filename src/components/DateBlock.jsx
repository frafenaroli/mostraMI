import styles from './Rows.module.css';
import { dateParts } from '../lib/exhibits';

// Calendar-leaf date: month, big day number, weekday.
export function DateBlock({ date }) {
  const { mon, day, dow } = dateParts(date);
  return (
    <span className={styles.dateBlock}>
      <span className={styles.mon}>{mon}</span>
      <span className={styles.day}>{day}</span>
      <span className={styles.dow}>{dow}</span>
    </span>
  );
}
