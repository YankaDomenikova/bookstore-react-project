import { Link } from 'react-router-dom';
import { Paths } from '../../paths/paths';
import styles from './Home.module.css'

export default function Home() {
    return (
        <>
            <div className={styles.banner}>
                <img src="books-cover-2-removebg-preview.png" alt="" />
                <div className={styles.bannerText}>
                    <h1>Books for everyone</h1>
                    <Link to={Paths.Catalog}>Shop now</Link>
                </div>
                <img src="books-cover-3-removebg-preview.png" alt="" />
            </div >
        </>
    );
}