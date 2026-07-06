import styles from './PageShell.module.css';
import { GradientAura } from './GradientAura';

export function PageShell({ aura = false, children }) {
  return (
    <div className={styles.shell}>
      {aura && <GradientAura />}
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
