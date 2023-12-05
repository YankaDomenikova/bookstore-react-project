import { Link } from 'react-router-dom';

import { Paths } from '../../paths/paths';

import styles from './Header.module.css';
import basketIcon from '../../assets/basket-svgrepo-com.svg';

export default function Header() {
    return (
        <header>
            <Link to={Paths.Home} className={styles.logo}>
                <img src="logo-dark.svg" alt="" />
                <h1>Bookstore</h1>
            </Link>

            <nav>
                <ul className={styles.navLinks}>
                    <li>
                        <Link to={Paths.Home} className={styles.link}>Home</Link>
                    </li>
                    <li>
                        <Link to={Paths.Catalog} className={styles.link}>Book Catalog</Link>
                    </li>
                    <li>
                        <Link to={Paths.Bestsellers} className={styles.link}>Bestsellers</Link>
                    </li>
                    <li>
                        <Link to={Paths.Contacts} className={styles.link}>Contacts</Link>
                    </li>
                </ul>
            </nav>


            <div className={styles.shopping}>
                <div className={styles.basket}>
                    <img src={basketIcon} alt="" />
                    <span className={styles.quantity}>3</span>
                </div>
                <div className={styles.auth}>
                    <Link to={Paths.Login} className={styles.link}>Login</Link>
                    {/* <img className="avatar" src="svg/user-alt-svgrepo-com.svg" alt=""> */}
                </div>
            </div>
        </header>
        // <header>
        //     <div className={styles.headerTop}>
        //         <div className={`${styles.links} ${styles.linksMain}`}>
        //             <ul>
        //                 <li>
        //                     <Link to={Paths.Home} className={styles.link} href="/">
        //                         Home
        //                     </Link>
        //                 </li>
        //                 <li>
        //                     <Link to={Paths.Contacts} className={styles.link}>
        //                         Contacts
        //                     </Link>
        //                 </li>
        //             </ul>
        //         </div>
        //         <Link className={styles.logoWrapper} to={Paths.Home}>
        //             <img className={styles.logoImg} src="logo.png" alt="" />
        //             <p className={styles.siteTitle}>Bookstore</p>
        //         </Link>
        //         <div className={styles.shopping}>
        //             <div className={styles.shoppingCart}>
        //                 <img src={basketIcon} alt="" />

        //                 <div className={styles.cartItemsQuantity}>
        //                     <span>3</span>
        //                 </div>
        //             </div>
        //             <div className={styles.authLink}>
        //                 <Link to={Paths.Login} className={styles.link}>Login</Link>
        //             </div>
        //         </div>
        //     </div>
        //     <div className={styles.headerBottom}>
        //         <div className={`${styles.links} ${styles.bookLinks}`}>
        //             <ul>
        //                 <li>
        //                     <Link to={Paths.Catalog} className={styles.link}>
        //                         Book Catalog
        //                     </Link>
        //                 </li>
        //                 {/* <li>
        //                     <Link to='/bestsellers' className={styles.link}>
        //                         Bestsellers
        //                     </Link>
        //                 </li> */}
        //             </ul>
        //         </div>
        //     </div>
        // </header>
    );
}