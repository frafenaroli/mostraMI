import styles from './CarouselCard.module.css';
import { TagBadge } from './TagBadge';
import { LuogoIcon } from './LuogoIcon';
import { Icon } from '../icons/Icon';
import { ExhibitLink } from './ExhibitLink';

export function CarouselCard({ item }) {
  return (
    <ExhibitLink id={item.id} className={styles.card}>
      <div className={styles.icon}>
        <LuogoIcon luogo={item.luogo} size={28} />
      </div>
      <div className={styles.tags}>
        {item.tags.slice(0, 2).map((t) => (
          <TagBadge key={t.id} {...t} />
        ))}
      </div>
      <div className={styles.name}>{item.name}</div>
      <div className={styles.desc}>{item.descrizioneBreve}</div>
      <div className={styles.arrowRow}>
        <Icon name="arrowUpRight" size={18} color="oklch(50% 0.14 20)" />
      </div>
    </ExhibitLink>
  );
}
