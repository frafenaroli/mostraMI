import { Link } from 'react-router-dom';

// Links to an exhibit page. `fromApp` tells the page it was opened in-app, so
// its back control can return to the previous view instead of the home.
export function ExhibitLink({ id, children, className }) {
  return (
    <Link to={`/mostra/${id}`} state={{ fromApp: true }} className={className}>
      {children}
    </Link>
  );
}
