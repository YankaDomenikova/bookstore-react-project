import styles from './NotFound.module.css';

export default function NotFound() {
    return (
        <div className={styles.notFound}>
            <img className={styles.notfoundImg} src="404.png" alt="" />
            <h2 className={styles.notfoundText}>Page not found</h2>
            <a className={styles.homeLink} href="">Go to homepage</a>
        </div>
    );
}