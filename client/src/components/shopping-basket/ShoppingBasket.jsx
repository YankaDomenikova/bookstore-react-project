import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ShoppingContext from '../../contexts/ShoppingContext';
import AuthContext from '../../contexts/AuthContext';
import ShoppingBasketItem from './shopping-basket-item/ShoppingBasketItem';
import { Paths } from '../../paths/paths';

import styles from './ShoppingBasket.module.css';
import maestroIcon from '../../assets/maestro-svgrepo-com.svg';
import masterIcon from '../../assets/mastercard-2-svgrepo-com.svg';
import paypalIcon from '../../assets/paypal-svgrepo-com.svg';

export default function ShoppingBasket() {
    const { basketItems, totalPrice, totalQuantity } = useContext(ShoppingContext);
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const redirect = () => {
        if (isAuthenticated) {
            navigate(Paths.Checkout);
        } else {
            navigate(Paths.Login);
        }
    }

    return (
        <div className={styles.pageContent}>
            <h2>Shopping Basket</h2>
            <div className={styles.warpper}>
                <div className={styles.basketContent}>
                    {basketItems.map(item => <ShoppingBasketItem key={item._id} {...item} />)}

                    {basketItems.length === 0 && <h3 className={styles.emptyBasketMessage}>Your basket is empty</h3>}
                </div>
                <div className={styles.additionalInfo}>
                    <div className={styles.orderDetails}>
                        <h4>Order details</h4>
                        <div>
                            <p className={styles.row}>Subtotal <span>$ {totalPrice}</span></p>
                            <p className={styles.row}>Shipping<span>-</span></p>
                            <p className={styles.row}>Discount <span>-</span></p>
                        </div>
                        <h4 className={`${styles.row} ${styles.total}`}>Estimated total <span>$ {totalPrice}</span></h4>
                    </div>
                    <button className={styles.checkoutBtn} onClick={redirect} disabled={basketItems.length === 0}>
                        Ckeckout
                    </button>


                    <form className={styles.coupons}>
                        <h5>Coupon code</h5>
                        <div className={styles.input}>
                            <input type={styles.text} />
                            <button>Apply</button>
                        </div>
                    </form>

                    <div className={styles.payment}>
                        <h5>We accept</h5>
                        <div className={styles.paymentMethods}>
                            <span>Payment on delivery</span>
                            <img src={maestroIcon} alt="" />
                            <img src={masterIcon} alt="" />
                            <img src={paypalIcon} className={styles.paypal} />
                        </div>
                    </div>

                    <div className={styles.returnInfo}>
                        <p>You have 30 day to return your order. For more information <span>read about order returns and refunding</span>.</p>
                    </div>
                </div>
            </div>

        </div>

    )
}