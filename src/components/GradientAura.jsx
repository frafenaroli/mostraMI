import styles from './GradientAura.module.css';

export function GradientAura() {
  return (
    <>
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />
      <div className={`${styles.blob} ${styles.blob3}`} />
    </>
  );
}
