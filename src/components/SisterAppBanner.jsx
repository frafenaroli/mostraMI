import styles from './SisterAppBanner.module.css';
import { Icon } from '../icons/Icon';

const DISSETAMI_URL = 'https://frafenaroli.github.io/dissetaMI/';

// Link to the sister app, styled like the home banners (ArchiveBanner).
export function SisterAppBanner() {
  return (
    <div className={styles.wrap}>
      <a href={DISSETAMI_URL} className={styles.banner}>
        <div className={styles.iconWrap}>
          <Icon name="droplet" size={26} color="oklch(52% 0.11 215)" strokeWidth={1.7} />
        </div>
        <div className={styles.text}>
          <div className={styles.title}>La cultura ti mette sete?</div>
          <div className={styles.subtitle}>Con DissetaMI trovi la vedovella o la casa dell'acqua più vicina.</div>
        </div>
        <Icon name="arrowRight" size={20} color="var(--color-text)" className={styles.arrow} />
      </a>
    </div>
  );
}
