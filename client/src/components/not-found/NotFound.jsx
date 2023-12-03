import { Link } from 'react-router-dom';

import { Paths } from '../../paths/paths';
import styles from './NotFound.module.css';

export default function NotFound() {
    return (
        <div className={styles.notFound}>
            <img className={styles.notfoundImg} src="404.png" alt="" />
            <h2 className={styles.notfoundText}>Page not found</h2>
            <Link to={Paths.Home} className={styles.homeLink}>Go to homepage</Link>
        </div>
    );
}