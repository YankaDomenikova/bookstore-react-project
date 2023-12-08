import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner() {
    return (
        <div className={styles.loaderInner}>
            <div className={`${styles.bgDark} ${styles.loaderLineWrap}`}>
                <div className={styles.loaderLine}></div>
            </div>
            <div className={styles.loaderLineWrap}>
                <div className={styles.loaderLine}></div>
            </div>
            <div className={styles.loaderLineWrap}>
                <div className={styles.loaderLine}></div>
            </div>
            <div className={styles.loaderLineWrap}>
                <div className={styles.loaderLine}></div>
            </div>
            <div className={styles.loaderLineWrap}>
                <div className={styles.loaderLine}></div>
            </div>
        </div>
    )
}