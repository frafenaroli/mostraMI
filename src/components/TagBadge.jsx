export function TagBadge({ label, light, fg, border, size = 'md' }) {
  const pad = size === 'sm' ? '2px 9px' : '3px 10px';
  const font = size === 'sm' ? '10.5px' : '11px';
  return (
    <span
      style={{
        font: `500 ${font} var(--font-sans)`,
        padding: pad,
        borderRadius: 20,
        background: light,
        color: fg,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
