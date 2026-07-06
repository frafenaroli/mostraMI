import { Link } from 'react-router-dom';
import { Icon } from '../icons/Icon';

export function IconButton({ icon, size = 38, iconSize = 17, glass = true, label, onClick, to }) {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: glass ? 'var(--color-surface-glass-strong)' : 'var(--color-surface)',
    backdropFilter: glass ? 'blur(10px)' : undefined,
    border: `1px solid ${glass ? 'var(--color-border-glass)' : 'var(--color-border-soft)'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    cursor: 'pointer',
    textDecoration: 'none',
  };
  const content = <Icon name={icon} size={iconSize} color="oklch(30% 0.02 40)" strokeWidth={2} />;
  if (to) {
    return (
      <Link to={to} aria-label={label} style={style}>
        {content}
      </Link>
    );
  }
  return (
    <button aria-label={label} style={style} onClick={onClick} type="button">
      {content}
    </button>
  );
}
