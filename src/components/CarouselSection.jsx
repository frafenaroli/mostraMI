import { Link } from 'react-router-dom';
import styles from './CarouselSection.module.css';
import { CarouselCard } from './CarouselCard';

export function CarouselSection({ title, items, linkTo, linkLabel }) {
  return (
    <div className={styles.section}>
      <div className={styles.head}>
        <div className={styles.title}>{title}</div>
        <Link to={linkTo} className={styles.link}>{linkLabel} →</Link>
      </div>
      <div className={`${styles.track} hide-scrollbar`}>
        {items.map((item) => (
          <CarouselCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
