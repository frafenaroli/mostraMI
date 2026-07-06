import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useExhibitsData } from '../lib/ExhibitsContext';
import { LUOGO_HUES } from '../lib/exhibits';
import { IconButton } from '../components/IconButton';
import { LuogoIcon } from '../components/LuogoIcon';
import { TagBadge } from '../components/TagBadge';
import { Pill } from '../components/Pill';
import { Icon } from '../icons/Icon';
import styles from './ExhibitModal.module.css';

export default function ExhibitModal() {
  const { id } = useParams();
  const { status, exhibits } = useExhibitsData();
  const navigate = useNavigate();
  const location = useLocation();

  const close = () => {
    const bg = location.state?.backgroundLocation;
    if (bg) navigate(`${bg.pathname}${bg.search || ''}`);
    else navigate('/');
  };

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  if (status === 'loading') return null;

  const exhibit = exhibits.find((e) => e.id === id);
  if (!exhibit) {
    return (
      <div className={styles.scrim} onClick={close}>
        <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
          <div className={styles.status}>Mostra non trovata.</div>
        </div>
      </div>
    );
  }

  const hue = LUOGO_HUES[exhibit.luogo] ?? 60;

  return (
    <div className={styles.scrim} onClick={close}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.aura} style={{ background: `radial-gradient(circle, oklch(82% 0.11 ${hue} / .9), transparent 72%)` }} />

        <div className={styles.closeRow}>
          <IconButton icon="close" size={36} iconSize={16} label="Chiudi" onClick={close} />
        </div>

        <div className={styles.titleRow}>
          <LuogoIcon luogo={exhibit.luogo} size={34} strokeWidth={1.4} />
          <div className={styles.name} style={{ color: `oklch(22% 0.05 ${hue})` }}>{exhibit.name}</div>
        </div>

        <div className={styles.content}>
          <div className={styles.tags}>
            {exhibit.tags.map((t) => (
              <TagBadge key={t.id} {...t} />
            ))}
          </div>

          {exhibit.sede !== exhibit.name && (
            <div className={styles.metaRow} style={{ color: `oklch(45% 0.1 ${hue})` }}>
              <Icon name="mapPin" size={14} strokeWidth={1.8} />
              {exhibit.sede}
            </div>
          )}

          <div className={styles.metaRow} style={{ color: `oklch(45% 0.1 ${hue})` }}>
            <Icon name={exhibit.isPermanent ? 'mostra-permanente' : 'calendar'} size={14} strokeWidth={1.8} />
            {exhibit.dateRangeLabel}
          </div>

          <div className={styles.descBreve} style={{ color: `oklch(40% 0.05 ${hue})` }}>{exhibit.descrizioneBreve}</div>
          <div className={styles.descLunga}>{exhibit.descrizioneLunga}</div>

          <div className={styles.actions}>
            <Pill as="a" href={exhibit.mapsUrl} target="_blank" rel="noreferrer" variant="primary">
              <Icon name="mapPin" size={16} />
              Portami qui!
            </Pill>
            <Pill as="a" href={exhibit.sitoWeb} target="_blank" rel="noreferrer" variant="outline">
              Approfondisci
              <Icon name="arrowUpRight" size={14} />
            </Pill>
          </div>
        </div>
      </div>
    </div>
  );
}
