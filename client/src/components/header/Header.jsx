import { Link } from 'react-router-dom';

import { Paths } from '../../paths/paths';

import styles from './Header.module.css';
import logo from '../../assets/logo-dark.svg';
import basketIcon from '../../assets/basket-svgrepo-com.svg';
import userIcon from '../../assets/user-alt-svgrepo-com.svg';
import { useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';

export default function Header() {
    const { isAuthenticated, username } = useContext(AuthContext);
    return (
        <header>
            <Link to={Paths.Home} className={styles.logo}>
                <img src={logo} alt="" />
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
                <Link className={styles.basket} to={Paths.ShoppingBasket}>
                    <img src={basketIcon} alt="" />
                    <span className={styles.quantity}>3</span>
                </Link>

                <div className={styles.auth}>
                    {isAuthenticated && (
                        <>
                            <img className={styles.avatar} src={userIcon} />
                            <Link to="/logout" className={styles.link}>Logout</Link>
                        </>
                    )}

                    {!isAuthenticated && <Link to={Paths.Login} className={styles.link}>Login</Link>}
                </div>
            </div>
        </header>

    );
}