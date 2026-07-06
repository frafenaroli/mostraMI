import styles from './FilterSheet.module.css';
import { Icon } from '../icons/Icon';
import { Pill } from './Pill';
import { LUOGO_LABELS, TEMA_LABELS, LUOGO_COLORS, TEMA_COLOR } from '../lib/exhibits';

const LUOGO_OPTIONS = [{ key: 'tutti', label: 'Tutti' }, ...Object.keys(LUOGO_LABELS).map((key) => ({ key, label: LUOGO_LABELS[key] }))];
const TEMA_OPTIONS = Object.keys(TEMA_LABELS).map((key) => ({ key, label: TEMA_LABELS[key] }));
const PERIODO_OPTIONS = [
  { key: 'in-corso', label: 'In corso' },
  { key: 'in-arrivo', label: 'In arrivo' },
  { key: 'ultimi-giorni', label: 'Ultimi giorni' },
];

function luogoChipStyle(key, active) {
  const c = key === 'tutti'
    ? { solid: 'oklch(25% 0.02 40)', light: 'oklch(99% 0 0)', fg: 'oklch(35% 0.02 40)', border: 'oklch(88% 0.01 60)' }
    : LUOGO_COLORS[key];
  return {
    background: active ? c.solid : c.light,
    color: active ? '#fff' : c.fg,
    borderColor: active ? c.solid : c.border,
  };
}

function temaChipStyle(active) {
  return {
    background: active ? TEMA_COLOR.fg : TEMA_COLOR.light,
    color: active ? '#fff' : TEMA_COLOR.fg,
    borderColor: active ? TEMA_COLOR.fg : TEMA_COLOR.border,
  };
}

function periodoChipStyle(active) {
  return {
    background: active ? 'oklch(25% 0.02 40)' : 'oklch(97% 0.005 60)',
    color: active ? '#fff' : 'oklch(40% 0.02 40)',
    borderColor: active ? 'oklch(25% 0.02 40)' : 'oklch(88% 0.008 60)',
  };
}

function switchTrackStyle(active, hue) {
  return {
    background: active ? `oklch(55% 0.1 ${hue})` : 'oklch(88% 0.01 60)',
    justifyContent: active ? 'flex-end' : 'flex-start',
  };
}

export function FilterSheet({ open, onClose, filters, onChange, onClear, resultsCount }) {
  if (!open) return null;

  function setLuogo(key) {
    onChange({ ...filters, luogo: key });
  }
  function toggleTema(key) {
    const has = filters.temi.includes(key);
    onChange({ ...filters, temi: has ? filters.temi.filter((t) => t !== key) : [...filters.temi, key] });
  }
  function togglePeriodo(key) {
    onChange({ ...filters, periodo: filters.periodo === key ? 'tutti' : key });
  }
  function toggleAbbonamento() {
    onChange({ ...filters, abbonamento: !filters.abbonamento });
  }
  function toggleFai() {
    onChange({ ...filters, fai: !filters.fai });
  }

  return (
    <>
      <div className={styles.scrim} onClick={onClose} />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="Filtri">
        <div className={styles.grabberRow}><div className={styles.grabber} /></div>
        <div className={styles.head}>
          <div className={styles.title}>Filtri</div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Chiudi">
            <Icon name="close" size={14} color="oklch(30% 0.02 40)" />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.sectionLabel}>Luogo</div>
          <div className={styles.chipWrap}>
            {LUOGO_OPTIONS.map((opt) => (
              <button key={opt.key} className={styles.chip} style={luogoChipStyle(opt.key, filters.luogo === opt.key)} onClick={() => setLuogo(opt.key)}>
                {opt.label}
              </button>
            ))}
          </div>

          <div className={styles.sectionLabel}>Tema</div>
          <div className={styles.chipWrap}>
            {TEMA_OPTIONS.map((opt) => (
              <button key={opt.key} className={styles.themeChip} style={temaChipStyle(filters.temi.includes(opt.key))} onClick={() => toggleTema(opt.key)}>
                {opt.label}
              </button>
            ))}
          </div>

          <div className={styles.sectionLabel}>Periodo</div>
          <div className={styles.periodoGrid}>
            {PERIODO_OPTIONS.map((opt) => (
              <button key={opt.key} className={styles.periodoChip} style={periodoChipStyle(filters.periodo === opt.key)} onClick={() => togglePeriodo(opt.key)}>
                {opt.label}
              </button>
            ))}
          </div>

          <div className={styles.sectionLabel}>Accesso</div>
          <button className={`${styles.switchRow} ${styles.bordered}`} onClick={toggleAbbonamento}>
            <span className={styles.switchLabel}>Abbonamento Musei Lombardia</span>
            <span className={styles.switchTrack} style={switchTrackStyle(filters.abbonamento, 150)}>
              <span className={styles.switchDot} />
            </span>
          </button>
          <button className={styles.switchRow} onClick={toggleFai}>
            <span className={styles.switchLabel}>Bene FAI</span>
            <span className={styles.switchTrack} style={switchTrackStyle(filters.fai, 210)}>
              <span className={styles.switchDot} />
            </span>
          </button>
        </div>

        <div className={styles.footer}>
          <Pill variant="outline" onClick={onClear}>Cancella filtri</Pill>
          <Pill variant="primary" onClick={onClose}>Mostra {resultsCount} risultati</Pill>
        </div>
      </div>
    </>
  );
}
