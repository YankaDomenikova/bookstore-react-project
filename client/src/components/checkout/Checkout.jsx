import { useContext } from "react";
import { Link } from 'react-router-dom';

import ShoppingContext from "../../contexts/ShoppingContext";

import styles from './Checkout.module.css';

export default function Checkout({ }) {
    const { basketItems, totalPrice } = useContext(ShoppingContext);
    return (
        <div className={styles.pageContent}>
            <h2 className={styles.mainHeading}>Checkout</h2>
            <form className={styles.finalizationForm}>
                <div className={styles.shippingDetails}>
                    <div className={styles.shippingAddress}>
                        <h4 className={styles.heading}>Shipping address</h4>
                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.email}`}>
                                <label htmlFor="email">Email</label>
                                <input type="email" name="email" id="email" />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.fullName}`}>
                                <label htmlFor="fullName">Full name</label>
                                <input type="text" name="fullName" id="fullName" />
                            </div>
                            <div className={`${styles.inputWrapper} ${styles.phonenumber}`}>
                                <label htmlFor="phoneNumber">Phone number</label>
                                <input type="tel" name="phoneNum" id="phoneNum" />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.address}`}>
                                <label htmlFor="address">Address</label>
                                <input type="text" name="address" id="address" />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.city}`}>
                                <label htmlFor="city">City</label>
                                <input type="text" name="city" id="city" />
                            </div>
                            <div className={`${styles.inputWrapper} ${styles.postalCode}`}>
                                <label htmlFor="postalCode">Postal code</label>
                                <input type="tel" name="postalCode" id="postalCode" maxlength="4" />
                            </div>
                        </div>
                    </div>
                    <div className={styles.shippingType}>
                        <h4 className={styles.heading}>Shipping</h4>
                        <div className={styles.options}>
                            <div className={styles.radioInputWrapper}>
                                <input type="radio" checked="checked" name="shippingType" id="standart" />
                                <label htmlFor="standart">Standart - FREE</label>
                            </div>
                            <div className={styles.radioInputWrapper}>
                                <input type="radio" name="shippingType" id="express" />
                                <label htmlFor="express">Express - $ 11.99</label>
                            </div>
                        </div>
                    </div>
                    <div className={styles.paymentMethod}>
                        <h4 className={styles.heading}>Payment method</h4>
                        <div className={styles.options}>
                            <div className={styles.radioInputWrapper}>
                                <input type="radio" checked="checked" name="paymentMethod" id="cash" />
                                <label htmlFor="cash">Cash (On delivery)</label>
                            </div>
                            <div className={styles.radioInputWrapper}>
                                <input type="radio" name="paymentMethod" id="card" />
                                <label htmlFor="card">Credit/Debit card</label>
                            </div>
                            <div className={styles.radioInputWrapper}>
                                <input type="radio" name="paymentMethod" id="paypal" />
                                <label htmlFor="paypal">Paypal</label>
                            </div>
                        </div>
                    </div>

                    <div className={styles.basketItems}>
                        <h4 className={styles.heading}>Items</h4>
                        <div className={styles.images}>
                            {basketItems.map(item => <img src={item.imageUrl} />)}
                        </div>
                    </div>
                </div>

                <div className={styles.finalization}>
                    <div className={styles.details}>
                        <div>
                            <p>Subtotal</p>
                            <p>$ 61.95</p>
                        </div>
                        <div>
                            <p>Shipping</p>
                            <p>Standart - FREE</p>
                        </div>
                        <div>
                            <p>Payment</p>
                            <p>Cash</p>
                        </div>
                        <div>
                            <p>Discount</p>
                            <p>-</p>
                        </div>
                        <div className={styles.estimatedTotal}>
                            <p>Estimated total</p>
                            <p>$ 66.95</p>
                        </div>
                    </div>
                    <button type="submit" className={styles.finalizeOrder}>Finalize order</button>
                </div>
            </form>
        </div>
    );
}