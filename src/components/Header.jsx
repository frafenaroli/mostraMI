import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.svg`;

export function Header() {
  return (
    <div className={styles.header}>
      <span className={styles.spacer} aria-hidden="true" />
      <Link to="/" className={styles.logo} aria-label="MostraMI - home">
        <img src={LOGO_SRC} alt="MostraMI" className={styles.logoImg} />
      </Link>
      <Link to="/mostre" className={styles.link}>Tutte le mostre →</Link>
    </div>
  );
}
