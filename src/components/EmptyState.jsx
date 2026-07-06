import styles from './EmptyState.module.css';
import { Icon } from '../icons/Icon';

export function EmptyState({ iconName = 'search', title, desc, children }) {
  return (
    <div className={styles.empty}>
      <Icon name={iconName} size={40} color="oklch(70% 0.01 60)" strokeWidth={1.6} />
      <div className={styles.title}>{title}</div>
      <div className={styles.desc}>{desc}</div>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
