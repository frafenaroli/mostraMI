import styles from './ListRow.module.css';
import { TagBadge } from './TagBadge';
import { LuogoIcon } from './LuogoIcon';
import { Icon } from '../icons/Icon';
import { ExhibitLink } from './ExhibitLink';

export function ListRow({ item }) {
  return (
    <ExhibitLink id={item.id} className={styles.row}>
      <div className={styles.icon}>
        <LuogoIcon luogo={item.luogo} size={26} strokeWidth={1.6} />
      </div>
      <div className={styles.body}>
        <div className={styles.tags}>
          {item.tags.map((t) => (
            <TagBadge key={t.id} size="sm" {...t} />
          ))}
        </div>
        <div className={styles.name}>{item.name}</div>
        <div className={styles.desc}>{item.descrizioneBreve}</div>
        {item.isUltimiGiorni && (
          <div className={styles.ultimiGiorni}>
            <Icon name="clock" size={11} />
            Ultimi giorni
          </div>
        )}
      </div>
      <Icon name="chevronRight" size={16} color="var(--color-icon-quiet)" className={styles.chevron} />
      <div className={styles.gridOnlyArrow}>
        <Icon name="arrowUpRight" size={18} color="oklch(50% 0.14 20)" />
      </div>
    </ExhibitLink>
  );
}
