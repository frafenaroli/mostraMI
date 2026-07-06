import styles from './Footer.module.css';

export function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.copy}>© 2026 MostraMI<br />Chi siamo · Come funziona · Contatti</div>
      <div className={styles.social}>
        <div className={styles.socialIcon}>IG</div>
        <div className={styles.socialIcon}>FB</div>
      </div>
    </div>
  );
}
