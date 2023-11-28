import styles from './Header.module.css';

export default function Header() {
    return (
        <header>
            <div className={styles.headerTop}>
                <div className={`${styles.links} ${styles.linksMain}`}>
                    <ul>
                        <li>
                            <a className={styles.link} href="">
                                Home
                            </a>
                        </li>
                        <li>
                            <a className={styles.link} href="">
                                Contacts
                            </a>
                        </li>
                    </ul>
                </div>
                <div className={styles.logoWrapper}>
                    <img className={styles.logoImg} src="logo.png" alt="" />
                    <p className={styles.siteTitle}>Bookstore</p>
                </div>
                <div className={styles.shopping}>
                    <div className={styles.shoppingCart}>
                        <svg
                            fill="#000000"
                            width="27px"
                            height="27px"
                            viewBox="0 0 32 32"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <title>basket</title>
                            <path d="M0 14v-3h3.75l7.531-7.532c-0.050-0.149-0.093-0.301-0.093-0.468 0-0.829 0.671-1.5 1.5-1.5 0.828 0 1.5 0.671 1.5 1.5s-0.672 1.5-1.5 1.5c-0.111 0-0.209-0.041-0.312-0.063l-6.564 6.563h19.354l-6.525-6.579c-0.129 0.036-0.252 0.079-0.391 0.079-0.828 0-1.5-0.672-1.5-1.5s0.672-1.5 1.5-1.5 1.5 0.671 1.5 1.5c0 0.153-0.045 0.293-0.088 0.433l7.567 7.567h3.771v3h-31zM24.869 28.902c-0.293 1.172-1.105 1.107-1.105 1.107l-16.595 0.032c-0.846 0-1.073-1.072-1.073-1.072l-4.387-13.955 27.574-0.026-4.414 13.914zM9.999 17h-1v5h1v-5zM9.999 23h-1v5h1v-5zM11.999 17h-0.999v5h0.999v-5zM11.999 23h-0.999v5h0.999v-5zM13.999 17h-1v5h1v-5zM13.999 23h-1v5h1v-5zM16 17h-1v5h1v-5zM16 23h-1v5h1v-5zM18 17h-1v5h1v-5zM18 23h-1v5h1v-5zM20 17h-1v5h1v-5zM20 23h-1v5h1v-5zM22 17h-1v5h1v-5zM22 23h-1v5h1v-5z" />
                        </svg>
                        <div className={styles.cartItemsQuantity}>
                            <span>3</span>
                        </div>
                    </div>
                    <div className={styles.authLink}>
                        <a href="" className={styles.link}>Login</a>

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
                            <a className={styles.link} href="">
                                Books
                            </a>
                        </li>
                        <li>
                            <a className={styles.link} href="">
                                Bestsellers
                            </a>
                        </li>
                        <li>
                            <a className={styles.link} href="">
                                Latest
                            </a>
                        </li>
                        <li>
                            <a className={styles.link} href="">
                                Sales
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}