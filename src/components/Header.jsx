import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export function Header() {
  return (
    <div className={styles.header}>
      <Link to="/" className={styles.logo}>MostraMI</Link>
      <Link to="/mostre" className={styles.link}>Tutte le mostre →</Link>
    </div>
  );
}
