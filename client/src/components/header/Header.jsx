import { Link } from 'react-router-dom';

import { Paths } from '../../paths/paths';

import styles from './Header.module.css';
import basketIcon from '../../assets/basket-svgrepo-com.svg';

export default function Header() {
    return (
        <header>
            <div className={styles.headerTop}>
                <div className={`${styles.links} ${styles.linksMain}`}>
                    <ul>
                        <li>
                            <Link to={Paths.Home} className={styles.link} href="/">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to={Paths.Contacts} className={styles.link}>
                                Contacts
                            </Link>
                        </li>
                    </ul>
                </div>
                <Link className={styles.logoWrapper} to={Paths.Home}>
                    <img className={styles.logoImg} src="logo.png" alt="" />
                    <p className={styles.siteTitle}>Bookstore</p>
                </Link>
                <div className={styles.shopping}>
                    <div className={styles.shoppingCart}>
                        <img src={basketIcon} alt="" />

                        <div className={styles.cartItemsQuantity}>
                            <span>3</span>
                        </div>
                    </div>
                    <div className={styles.authLink}>
                        <Link to={Paths.Login} className={styles.link}>Login</Link>

                        {/* <svg width="32px" height="32px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="1">
                            <g id="SVGRepo_bgCarrier" stroke-width="0" />
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
                            <g id="SVGRepo_iconCarrier"> <path d="M12.0001 13.09C14.4909 13.09 16.5101 11.0708 16.5101 8.58C16.5101 6.08919 14.4909 4.07 12.0001 4.07C9.5093 4.07 7.49011 6.08919 7.49011 8.58C7.49011 11.0708 9.5093 13.09 12.0001 13.09Z" stroke="#0F0F0F" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /> <path d="M8.98008 11.91C8.97008 11.91 8.97008 11.91 8.96008 11.92" stroke="#0F0F0F" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /> <path d="M16.9701 12.82C19.5601 14.4 21.3201 17.19 21.5001 20.4C21.5101 20.69 21.2801 20.93 20.9901 20.93H3.01007C2.72007 20.93 2.49007 20.69 2.50007 20.4C2.68007 17.21 4.43007 14.43 6.99007 12.85" stroke="#0F0F0F" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /> </g>
                        </svg> */}
                    </div>
                </div>
            </div>
            <div className={styles.headerBottom}>
                <div className={`${styles.links} ${styles.bookLinks}`}>
                    <ul>
                        <li>
                            <Link to={Paths.Catalog} className={styles.link}>
                                Catalog
                            </Link>
                        </li>
                        <li>
                            <Link to='/bestsellers' className={styles.link}>
                                Bestsellers
                            </Link>
                        </li>
                        <li>
                            <Link to='/sales' className={styles.link}>
                                Sales
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}