import { Link } from "react-router-dom";

import { Paths } from '../../paths/paths';
import styles from './Footer.module.css';

import maestroIcon from '../../assets/maestro-(2)-svgrepo-com.svg';
import masterardIcon from '../../assets/maestro-2-svgrepo-com.svg';
import paypalIcon from '../../assets/paypal-2-svgrepo-com.svg/';
import locklIcon from '../../assets/lock-keyhole-minimalistic-svgrepo-com.svg';
import mailIcon from '../../assets/mail-svgrepo-com.svg';
import addressIcon from '../../assets/address-location-map-svgrepo-com.svg';
import phoneIcon from '../../assets/phone-svgrepo-com.svg';

export default function Footer() {
    return (
        <footer>
            <div className={`${styles.row} ${styles.footerContent}`}>
                <div className={`${styles.container} ${styles.about}`}>
                    <p><span>Bookstore</span> provide a wide variety of books in various genres. There are books for people of all ages and interest. Have fun!</p>
                    <div className={styles.payment}>
                        <div className={styles.cards}>
                            <img src={maestroIcon} alt="" />
                            <img src={masterardIcon} alt="" />
                            <img src={paypalIcon} alt="" />
                        </div>
                        <div className={styles.securePayment}>
                            <img src={locklIcon} alt="" />
                            <p>Secure online Payment</p>
                        </div>
                    </div>
                </div>

                <div className={`${styles.container} ${styles.main}`}>
                    <img src="logo-dark.png" alt="" />
                    <div className={styles.siteLinks}>
                        <h4>Bookstore</h4>
                        <Link to={Paths.Home}>Home</Link>
                        <Link to={Paths.Catalog}>Catalog</Link>
                        <Link to={Paths.Bestsellers}>Bestsellers</Link>
                    </div>
                </div>

                <div className={`${styles.container} ${styles.contacts}`}>
                    <h4>Contacts</h4>
                    <div>
                        <img src={mailIcon} alt="" />
                        <p>bookstore@mail.com</p>
                    </div>
                    <div>
                        <img src={addressIcon} alt="" />
                        <p>Theodosii Turnovski St., Veliko Tarnovo</p>
                    </div>
                    <div>
                        <img src={phoneIcon} alt="" />
                        <p>123-456-789   (8:00 am - 18:30 pm)</p>
                    </div>
                </div>
            </div>
            <div className={`${styles.row} ${styles.copiright}`}>&copy; 2023 All rights reserved</div>
        </footer>
    );
}