import styles from './SurpriseBanner.module.css';
import { Icon } from '../icons/Icon';
import { ExhibitLink } from './ExhibitLink';

export function SurpriseBanner({ exhibit, onDismiss }) {
  return (
    <div className={styles.banner}>
      <Icon name="sparkles" size={18} color="oklch(50% 0.14 20)" strokeWidth={1.6} className={styles.sparkle} />
      <ExhibitLink id={exhibit.id} className={styles.content} style={{ display: 'block' }}>
        <div className={styles.label}>Ti proponiamo</div>
        <div className={styles.name}>{exhibit.name}</div>
        <div className={styles.desc}>{exhibit.descrizioneBreve}</div>
        <div className={styles.arrowRow}>
          <Icon name="arrowUpRight" size={16} color="oklch(50% 0.14 20)" />
        </div>
      </ExhibitLink>
      <button className={styles.dismiss} onClick={onDismiss} aria-label="Chiudi suggerimento">×</button>
    </div>
  );
}
