import { Link } from 'react-router-dom';
import styles from './ArchiveBanner.module.css';
import { Icon } from '../icons/Icon';

export function ArchiveBanner() {
  return (
    <Link to="/mostre" className={styles.banner}>
      <div>
        <div className={styles.title}>Tutte le mostre</div>
        <div className={styles.subtitle}>Sfoglia l'archivio completo, con filtri</div>
      </div>
      <Icon name="arrowRight" size={20} color="var(--color-text)" className={styles.arrow} />
    </Link>
  );
}
