import { Link } from 'react-router-dom';
import styles from './ArchiveBanner.module.css';
import { Icon } from '../icons/Icon';

function Banner({ to, icon, iconColor, title, className }) {
  return (
    <Link to={to} className={`${styles.banner} ${className}`}>
      <div className={styles.iconWrap}>
        <Icon name={icon} size={26} color={iconColor} strokeWidth={1.7} />
      </div>
      <div className={styles.title}>{title}</div>
      <Icon name="arrowRight" size={20} color="var(--color-text)" className={styles.arrow} />
    </Link>
  );
}

export function ArchiveBanner() {
  return (
    <div className={styles.row}>
      <Banner
        to="/mostre"
        icon="grid"
        iconColor="oklch(50% 0.14 20)"
        title="Tutte le mostre"
        className={styles.all}
      />
      <Banner
        to="/mostre?abbonamento=1"
        icon="mostra"
        iconColor="oklch(43% 0.11 150)"
        title="Abbonamento Musei Lombardia"
        className={styles.abbonamento}
      />
    </div>
  );
}
