import styles from './ShoppingBasket.module.css';

import plusIcon from '../../assets/plus-circle-svgrepo-com.svg';
import minIcon from '../../assets/minus-circle-svgrepo-com.svg';
import removeIcon from '../../assets/remove-svgrepo-com.svg';
import maestroIcon from '../../assets/maestro-svgrepo-com.svg';
import masterIcon from '../../assets/mastercard-2-svgrepo-com.svg';
import paypalIcon from '../../assets/paypal-svgrepo-com.svg';

export default function ShoppingBasket() {
    return (
        <div className={styles.pageContent}>
            <h2>Shopping Basket</h2>
            <div className={styles.warpper}>
                <div className={styles.basketContent}>
                    {/* <h3 className="emptyBasketMessage">Your basket is empty</h3> */}
                    <div className={styles.basketItems}>
                        <div className={styles.basketItem}>
                            <div className={styles.bookInfo}>
                                <img src="" alt="" />
                                <div className={styles.bookDetails}>
                                    <p className={styles.bookTitle}>Lorem ipsum dolor</p>
                                    <p className={styles.author}>Author name</p>
                                    <p className={`${styles.availability} ${styles.inStock}`}>In stock</p>
                                </div>
                            </div>

                            <div className={styles.quantityControls}>
                                <button className={styles.min}>
                                    <img src={minIcon} />
                                </button>
                                <p className={styles.qty}>1</p>
                                <button className={styles.plus}>
                                    <img src={plusIcon} alt="" />
                                </button>
                            </div>

                            <div className={styles.priceByQuantity}>$ 41.95</div>

                            <button className={styles.remove}>
                                <img src={removeIcon} alt="" />
                            </button>

                        </div>
                    </div>
                </div>
                <div className={styles.additionalInfo}>
                    <div className={styles.orderDetails}>
                        <h4>Order details</h4>
                        <div>
                            <p className={styles.row}>Subtotal <span>$ 61.95</span></p>
                            <p className={styles.row}>Shipping<span>-</span></p>
                            <p className={styles.row}>Discount <span>-</span></p>
                        </div>
                        <h4 className={`${styles.row} ${styles.total}`}>Estimated total <span>$ 61.95</span></h4>
                    </div>
                    <button className={styles.checkoutBtn}>
                        <a href="">Ckeckout</a>
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