import { Link } from 'react-router-dom';
import styles from './SectionHead.module.css';

export function SectionHead({ title, linkTo, linkLabel, id }) {
  return (
    <div className={styles.head}>
      <h2 className={styles.title} id={id}>{title}</h2>
      {linkTo && <Link to={linkTo} className={styles.link}>{linkLabel}</Link>}
    </div>
  );
}
