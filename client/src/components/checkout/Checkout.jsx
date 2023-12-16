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
        let orderNumber = new Date().valueOf();
        try {
            const result = await orderService.create(
                values.email,
                values.fullName,
                values.phoneNumber,
                values.address,
                values.city,
                values.postalCode,
                orderNumber,
                basketItems,
                totalPrice,
                totalQuantity
            );
            resetBasket();
            navigate(`/order-success/${orderNumber}`);
        } catch (err) {
            console.log(err);
        }

    }

    const { values, onChange, onSubmit, onBlur, errors } = useForm(createOrderHandler, {
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
                        {errors.required && <p className={styles.errorMessage}>{errors.required}</p>}
                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.email}`}>
                                <label htmlFor="email">Email</label>
                                <input
                                    className={`${styles.formInput} ${(errors.email || errors.required) && styles.error}`}
                                    type="email"
                                    name={formKeys.email}
                                    id="email"
                                    value={values[formKeys.email]}
                                    onChange={onChange}
                                    onBlur={() => onBlur(formKeys.email)}
                                />
                                <div className={styles.errorContainer}>
                                    {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
                                </div>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.fullName}`}>
                                <label htmlFor="fullName">Full name</label>
                                <input
                                    className={`${styles.formInput} ${(errors.fullName || errors.required) && styles.error}`}
                                    type="text"
                                    name={formKeys.fullName}
                                    id="fullName"
                                    value={values[formKeys.fullName]}
                                    onChange={onChange}
                                    onBlur={() => onBlur(formKeys.fullName)}
                                />
                                <div className={styles.errorContainer}>
                                    {errors.fullName && <p className={styles.errorMessage}>{errors.fullName}</p>}
                                </div>
                            </div>


                            <div className={`${styles.inputWrapper} ${styles.phonenumber}`}>
                                <label htmlFor="phoneNumber">Phone number</label>
                                <input
                                    className={`${styles.formInput} ${(errors.phoneNumber || errors.required) && styles.error}`}
                                    type="tel"
                                    name={formKeys.phoneNumber}
                                    id="phoneNum"
                                    placeholder="+359881234567"
                                    value={values[formKeys.phoneNumber]}
                                    onChange={onChange}
                                    onBlur={() => onBlur(formKeys.phoneNumber)}
                                />
                                <div className={styles.errorContainer}>
                                    {errors.phoneNumber && <p className={styles.errorMessage}>{errors.phoneNumber}</p>}
                                </div>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.address}`}>
                                <label htmlFor="address">Address</label>
                                <input
                                    className={`${styles.formInput} ${(errors.address || errors.required) && styles.error}`}
                                    type="text"
                                    name={formKeys.address}
                                    id="address"
                                    value={values[formKeys.address]}
                                    onChange={onChange}
                                    onBlur={() => onBlur(formKeys.address)}
                                />
                            </div>
                        </div>
                        <div className={styles.errorContainer}>
                            {errors.address && <p className={styles.errorMessage}>{errors.address}</p>}
                        </div>
                        <div className={styles.row}>
                            <div className={`${styles.inputWrapper} ${styles.city}`}>
                                <label htmlFor="city">City</label>
                                <input
                                    className={`${styles.formInput} ${(errors.city || errors.required) && styles.error}`}
                                    type="text"
                                    name={formKeys.city}
                                    id="city"
                                    value={values[formKeys.city]}
                                    onChange={onChange}
                                    onBlur={() => onBlur(formKeys.city)}
                                />
                                <div className={styles.errorContainer}>
                                    {errors.city && <p className={styles.errorMessage}>{errors.city}</p>}
                                </div>
                            </div>

                            <div className={`${styles.inputWrapper} ${styles.postalCode}`}>
                                <label htmlFor="postalCode">Postal code</label>
                                <input
                                    className={`${styles.formInput} ${(errors.postalCode || errors.required) && styles.error}`}
                                    type="text"
                                    name={formKeys.postalCode}
                                    id="postalCode"
                                    value={values[formKeys.postalCode]}
                                    onChange={onChange}
                                    onBlur={() => onBlur(formKeys.postalCode)}
                                />
                                <div className={styles.errorContainer}>
                                    {errors.postalCode && <p className={styles.errorMessage}>{errors.postalCode}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.shippingType}>
                        <h4 className={styles.heading}>Shipping</h4>
                        <div className={styles.options}>
                            <div className={styles.radioInputWrapper}>
                                <input type="radio" name="shippingType" id="standart" checked="true" />
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
                                <input type="radio" name="paymentMethod" id="cash" checked="true" />
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
                    <button type="submit" className={styles.finalizeOrder} disabled={Object.values(errors).some(x => x !== null)}>Finalize order</button>
                </div>
            </form>
        </div>
    );
}