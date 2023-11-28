export default function Header() {
    return (
        <header>
            <div className="headerTop">
                <div className="links linksMain">
                    <ul>
                        <li>
                            <a className="link" href="">
                                Home
                            </a>
                        </li>
                        <li>
                            <a className="link" href="">
                                About
                            </a>
                        </li>
                        <li>
                            <a className="link" href="">
                                Contacts
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="logoWrapper">
                    <img className="logo-img" src="logo1.png" alt="" />
                    <p className="site-title">Bookstore</p>
                </div>
                <div className="shopping">
                    <div className="shoppingCart">
                        <svg
                            fill="#000000"
                            width="28px"
                            height="28px"
                            viewBox="0 0 32 32"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <title>basket</title>
                            <path d="M0 14v-3h3.75l7.531-7.532c-0.050-0.149-0.093-0.301-0.093-0.468 0-0.829 0.671-1.5 1.5-1.5 0.828 0 1.5 0.671 1.5 1.5s-0.672 1.5-1.5 1.5c-0.111 0-0.209-0.041-0.312-0.063l-6.564 6.563h19.354l-6.525-6.579c-0.129 0.036-0.252 0.079-0.391 0.079-0.828 0-1.5-0.672-1.5-1.5s0.672-1.5 1.5-1.5 1.5 0.671 1.5 1.5c0 0.153-0.045 0.293-0.088 0.433l7.567 7.567h3.771v3h-31zM24.869 28.902c-0.293 1.172-1.105 1.107-1.105 1.107l-16.595 0.032c-0.846 0-1.073-1.072-1.073-1.072l-4.387-13.955 27.574-0.026-4.414 13.914zM9.999 17h-1v5h1v-5zM9.999 23h-1v5h1v-5zM11.999 17h-0.999v5h0.999v-5zM11.999 23h-0.999v5h0.999v-5zM13.999 17h-1v5h1v-5zM13.999 23h-1v5h1v-5zM16 17h-1v5h1v-5zM16 23h-1v5h1v-5zM18 17h-1v5h1v-5zM18 23h-1v5h1v-5zM20 17h-1v5h1v-5zM20 23h-1v5h1v-5zM22 17h-1v5h1v-5zM22 23h-1v5h1v-5z" />
                        </svg>
                    </div>
                    <button className="loginButton">Login</button>
                </div>
            </div>
            <div className="headerBottom">
                <div className="links bookLinks">
                    <ul>
                        <li>
                            <a className="link" href="">
                                Books
                            </a>
                        </li>
                        <li>
                            <a className="link" href="">
                                Bestsellers
                            </a>
                        </li>
                        <li>
                            <a className="link" href="">
                                Latest
                            </a>
                        </li>
                        <li>
                            <a className="link" href="">
                                Sales
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}