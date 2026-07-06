import { Link, useLocation } from 'react-router-dom';

// Navigates to the exhibit detail popup while remembering the page it was
// opened from, so the modal can render on top of it (and close back to it).
export function ExhibitLink({ id, children, style, className }) {
  const location = useLocation();
  return (
    <Link
      to={`/mostra/${id}`}
      state={{ backgroundLocation: location }}
      style={{ textDecoration: 'none', ...style }}
      className={className}
    >
      {children}
    </Link>
  );
}
