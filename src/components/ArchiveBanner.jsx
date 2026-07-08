import { Link } from 'react-router-dom';
import styles from './ArchiveBanner.module.css';
import { Icon } from '../icons/Icon';

function Banner({ to, icon, iconColor, title, subtitle, className }) {
  return (
    <Link to={to} className={`${styles.banner} ${className}`}>
      <div className={styles.iconWrap}>
        <Icon name={icon} size={22} color={iconColor} strokeWidth={1.8} />
      </div>
      <div className={styles.text}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
      <Icon name="arrowRight" size={20} color="var(--color-text)" className={styles.arrow} />
    </Link>
  );
}

export function ArchiveBanner() {
  return (
    <div className={styles.row}>
      <Banner
        to="/mostre"
        icon="filter"
        iconColor="oklch(50% 0.14 20)"
        title="Tutte le mostre"
        subtitle="Sfoglia l'archivio completo, con filtri"
        className={styles.all}
      />
      <Banner
        to="/mostre?abbonamento=1"
        icon="mostra"
        iconColor="oklch(43% 0.11 150)"
        title="Abbonamento Musei Lombardia"
        subtitle="Le mostre e i musei inclusi nell'abbonamento"
        className={styles.abbonamento}
      />
    </div>
  );
}
