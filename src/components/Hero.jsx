import styles from './Hero.module.css';

export function Hero() {
  return (
    <div className={styles.hero}>
      <div className={`${styles.headline} ${styles.mobileOnly}`}>
        Le mostre di Milano,<br /><span style={{ fontStyle: 'italic' }}>a portata di mano.</span>
      </div>
      <div className={`${styles.headline} ${styles.desktopOnly}`}>
        Le mostre di Milano, <span style={{ fontStyle: 'italic' }}>a portata di mano.</span>
      </div>
    </div>
  );
}
