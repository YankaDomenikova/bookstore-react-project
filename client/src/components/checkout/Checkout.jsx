import { useContext } from "react";
import { Link, useNavigate } from 'react-router-dom';

import ShoppingContext from "../../contexts/ShoppingContext";
import AuthContext from "../../contexts/AuthContext";
import useForm from '../../hooks/useForm';
import * as orderService from '../../services/orderService';

import styles from './Checkout.module.css';

const formKeys = {
    email: 'email',
    fullName: 'fullName',
    phoneNumber: 'phoneNumber',
    address: 'address',
    city: 'city',
    postalCode: 'postalCode',
}


export default function Checkout({ }) {
    const { basketItems, totalPrice, totalQuantity, resetBasket } = useContext(ShoppingContext);
    const { email } = useContext(AuthContext);
    const navigate = useNavigate();

    const createOrderHandler = async (values) => {
        try {
            const result = await orderService.create(
                values.email,
                values.fullname,
                values.phoneNumber,
                values.address,
                values.city,
                values.postalCode,
                basketItems,
                totalPrice,
                totalQuantity
            );
            resetBasket();
            navigate('/');
        } catch (err) {
            console.log(err);
        }

    }

    const { values, onChange, onSubmit } = useForm(createOrderHandler, {
        [formKeys.email]: email,
        [formKeys.fullName]: '',
        [formKeys.phoneNumber]: '',
        [formKeys.address]: '',
        [formKeys.city]: '',
        [formKeys.postalCode]: ''
    });


    return (
        <div className={styles.pageContent}>
            <h2 className={styles.mainHeading}>Checkout</h2>
            <form className={styles.finalizationForm} onSubmit={onSubmit}>
                <div className={styles.shippingDetails}>
                    <div className={styles.shippingAddress}>
                        <h4 className={styles.heading}>Shipping address</h4>
                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.email}`}>
                                <label htmlFor="email">Email</label>
                                <input type="email" name={formKeys.email} id="email" value={values[formKeys.email]} onChange={onChange} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.fullName}`}>
                                <label htmlFor="fullName">Full name</label>
                                <input type="text" name={formKeys.fullName} id="fullName" value={values[formKeys.fullName]} onChange={onChange} />
                            </div>
                            <div className={`${styles.inputWrapper} ${styles.phonenumber}`}>
                                <label htmlFor="phoneNumber">Phone number</label>
                                <input type="tel" name={formKeys.phoneNumber} id="phoneNum" value={values[formKeys.phoneNumber]} onChange={onChange} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.address}`}>
                                <label htmlFor="address">Address</label>
                                <input type="text" name={formKeys.address} id="address" value={values[formKeys.address]} onChange={onChange} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.city}`}>
                                <label htmlFor="city">City</label>
                                <input type="text" name={formKeys.city} id="city" value={values[formKeys.city]} onChange={onChange} />
                            </div>
                            <div className={`${styles.inputWrapper} ${styles.postalCode}`}>
                                <label htmlFor="postalCode">Postal code</label>
                                <input type="tel" name={formKeys.postalCode} id="postalCode" maxLength="4" value={values[formKeys.postalCode]} onChange={onChange} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.shippingType}>
                        <h4 className={styles.heading}>Shipping</h4>
                        <div className={styles.options}>
                            <div className={styles.radioInputWrapper}>
                                <input type="radio" name="shippingType" id="standart" />
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
                                <input type="radio" name="paymentMethod" id="cash" />
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
                            {basketItems.map(item => <img src={item.imageUrl} key={item._id} />)}
                        </div>
                    </div>
                </div>

                <div className={styles.finalization}>
                    <div className={styles.details}>
                        <div>
                            <p>Subtotal</p>
                            <p>$ {totalPrice}</p>
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
                            <p>$ {totalPrice}</p>
                        </div>
                    </div>
                    <button type="submit" className={styles.finalizeOrder}>Finalize order</button>
                </div>
            </form>
        </div>
    );
}