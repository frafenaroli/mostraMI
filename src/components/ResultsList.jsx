import styles from './ResultsList.module.css';
import { ListRow } from './ListRow';

export function ResultsList({ items }) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <ListRow key={item.id} item={item} />
      ))}
    </div>
  );
}
