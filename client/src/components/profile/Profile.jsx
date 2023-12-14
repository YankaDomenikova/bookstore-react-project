import { Link } from 'react-router-dom';
import styles from './Profile.module.css'
import arrowRight from '../../assets/arrow-right-svgrepo-com.svg';

export default function Profile() {
    return (
        <div className={styles.pageContent}>
            <div class={styles.authinfo}>
                <h3>Username</h3>
                <p>mail@mail.com</p>
            </div>

            <div class={styles.nav}>
                <h5 class={styles.navItem}>My orders</h5>
            </div>

            <div className={styles.ordersContainer}>
                <div class={styles.order}>
                    <div class={styles.orderOverview}>
                        <p class={styles.orderNumber}>99654821</p>
                        <div>
                            <p>$ 55.05</p>
                            <p>18 June 2023</p>
                        </div>
                    </div>
                    <Link class={styles.arrow}>
                        <img src={arrowRight} alt="" />
                    </Link>
                </div>


            </div>
        </div>
    );
}