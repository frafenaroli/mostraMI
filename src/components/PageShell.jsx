import { useNavigationType } from 'react-router-dom';
import styles from './PageShell.module.css';

// Pages reached by a forward navigation rise in by 8px; back/forward and the
// first load render in place, so restored scroll positions don't jump.
export function PageShell({ children }) {
  const enter = useNavigationType() === 'PUSH';
  return (
    <div className={styles.shell}>
      <div className={`${styles.inner} ${enter ? styles.enter : ''}`}>{children}</div>
    </div>
  );
}
