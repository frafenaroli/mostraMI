import styles from './Chip.module.css';

// Square-cornered filter chip. Pass `pressed` for a toggle (aria-pressed), or
// `as={Link}` for a shortcut that just navigates.
export function Chip({ as: As = 'button', pressed, className = '', children, ...rest }) {
  const cls = [styles.chip, pressed && styles.active, className].filter(Boolean).join(' ');
  const extra = As === 'button' ? { type: 'button', 'aria-pressed': pressed === undefined ? undefined : pressed } : {};
  return (
    <As className={cls} {...extra} {...rest}>
      {children}
    </As>
  );
}

export function ChipRow({ children, label }) {
  return (
    <div className={`${styles.row} hide-scrollbar`} role="group" aria-label={label}>
      {children}
    </div>
  );
}

// A native <select> dressed as a chip: shows `label` until a value is picked.
export function ChipSelect({ label, value, options, onChange }) {
  return (
    <span className={`${styles.chip} ${styles.select} ${value ? styles.active : ''}`}>
      <span aria-hidden="true">{value ? options.find((o) => o.value === value)?.label : label}</span>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{label}: tutti</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </span>
  );
}
