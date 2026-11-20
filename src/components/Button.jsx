import styles from './Button.module.css';

// Full-height (50px) action. `primary` is the dark filled button, `outline` the
// bordered one; `compact` is the shorter, content-width "Mostrami le altre" style.
export function Button({ as: As = 'button', variant = 'outline', compact, className = '', children, ...rest }) {
  const cls = [styles.button, styles[variant], compact && styles.compact, className].filter(Boolean).join(' ');
  if (As === 'button' && !rest.type) rest.type = 'button';
  return (
    <As className={cls} {...rest}>
      {children}
    </As>
  );
}
