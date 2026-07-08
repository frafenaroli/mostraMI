import styles from './Footer.module.css';

const CLAUDE_CODE_SRC = `${import.meta.env.BASE_URL}claudecode.png`;

export function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.copy}>
        © 2026 MostraMI MVP by Francesca Fenaroli<br />
        Made with ❤️ &amp; <img src={CLAUDE_CODE_SRC} alt="Claude Code" className={styles.ccLogo} />
      </div>
    </div>
  );
}
