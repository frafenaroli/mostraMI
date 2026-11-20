import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { Icon } from '../icons/Icon';

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.svg`;

// Three-slot app bar: optional back control, centered logo, calendar shortcut
// (rendered as the "you are here" state on the calendar itself).
export function Header({ back, current }) {
  return (
    <header className={styles.header}>
      {back ? (
        back.onClick ? (
          <button type="button" className={styles.slot} onClick={back.onClick} aria-label={back.label}>
            <Icon name="back" size={22} />
          </button>
        ) : (
          <Link to={back.to} className={styles.slot} aria-label={back.label}>
            <Icon name="back" size={22} />
          </Link>
        )
      ) : (
        <span aria-hidden="true" />
      )}
      <Link to="/" className={styles.logo} aria-label="MostraMI, home">
        <img src={LOGO_SRC} alt="MostraMI" className={styles.logoImg} />
      </Link>
      {current === 'calendario' ? (
        <span className={styles.slot} aria-current="page" title="Sei nel calendario">
          <Icon name="calendar" size={22} fill="var(--color-border)" />
        </span>
      ) : (
        <Link to="/mostre" className={styles.slot} aria-label="Calendario delle mostre">
          <Icon name="calendar" size={22} />
        </Link>
      )}
    </header>
  );
}
