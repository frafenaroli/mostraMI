import styles from './Pill.module.css';

export function Pill({ as: As = 'button', variant = 'primary', small, className = '', style, children, ...rest }) {
  const cls = [styles.pill, styles[variant], small && styles.small, className].filter(Boolean).join(' ');
  return (
    <As className={cls} style={style} {...rest}>
      {children}
    </As>
  );
}
