import styles from './Footer.module.css';
import { Icon } from '../icons/Icon';
import { formatLong } from '../lib/exhibits';

const CLAUDE_CODE_SRC = `${import.meta.env.BASE_URL}claudecode.png`;

export function Footer({ generatedAt }) {
  const updated = generatedAt ? new Date(generatedAt) : null;
  return (
    <footer className={styles.footer}>
      {updated && !Number.isNaN(updated.getTime()) && <span>Dati aggiornati al {formatLong(updated)}</span>}
      <span>© 2026 MostraMI by Francesca Fenaroli</span>
      <span className={styles.made}>
        Made with
        <Icon name="heart" size={13} color="var(--color-accent-default)" fill="var(--color-accent-default)" />
        <span className="visually-hidden">amore</span>
        &amp;
        <img src={CLAUDE_CODE_SRC} alt="Claude Code" className={styles.ccLogo} />
      </span>
    </footer>
  );
}
