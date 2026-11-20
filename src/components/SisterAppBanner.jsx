import styles from './SisterAppBanner.module.css';

const DISSETAMI_URL = 'https://frafenaroli.github.io/dissetaMI/';

export function SisterAppBanner() {
  return (
    <section className={styles.wrap}>
      <a href={DISSETAMI_URL} className={styles.box}>
        <span className={styles.title}>La cultura ti mette sete?</span>
        <span className={styles.text}>DissetaMI trova la vedovella o la casa dell'acqua più vicina.</span>
        <span className={styles.cta}>Apri DissetaMI</span>
      </a>
    </section>
  );
}
