import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import * as orderService from '../../services/orderService';
import { convert } from "../../utils/dateConverter";

import styles from './OrderDetails.module.css';
import checkmark from '../../assets/checkmark-small-svgrepo-com.svg';
import { Paths } from "../../paths/paths";

export default function OrderDetails() {
    const [order, setOrder] = useState({});
    const { orderId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        orderService.getOrderById(orderId)
            .then(result => setOrder(result));

    }, []);

    const deleteOrderhandler = async () => {
        try {
            await orderService.remove(orderId);
            navigate(Paths.Profile);
        } catch (err) {
            console.log(err)
        };

    }


    console.log(order);
    return (
        <div className={styles.pageContent}>
            <h2 className={styles.mainHeading}>Order details</h2>
            <div className={styles.container}>
                <div className={styles.orderNumber}>
                    <h4>Order number</h4>
                    <p>{order.orderNumber}</p>
                </div>
                <div className={styles.orderDate}>
                    <h4>Order date</h4>
                    <p>{convert(order._createdOn)}</p>
                </div>
            </div>

            <div className={styles.detailsContainer}>
                <div className={styles.orderStatusHistory}>
                    <div className={styles.wrapper}>
                        <div className={styles.status}>
                            <div className={`${styles.progress} ${styles.done}`}>
                                <img src={checkmark} alt="" />
                            </div>
                            <p>Order has been received</p>
                        </div>
                        <p className={styles.statusDate}>{convert(order._createdOn)}</p>
                    </div>
                    <div className={styles.wrapper}>
                        <div className={styles.status}>
                            <div className={styles.progress}>
                            </div>
                            <p>Processing order</p>
                        </div>
                    </div>
                    <div className={styles.wrapper}>
                        <div className={styles.status}>
                            <div className={styles.progress}>
                            </div>
                            <p>Order has been sent</p>
                        </div>
                    </div>
                    <div className={styles.wrapper}>
                        <div className={styles.status}>
                            <div className={styles.progress}>
                            </div>
                            <p>Order has been delivered</p>
                        </div>
                    </div>

                </div>

                <div className={styles.orderItems}>
                    {order.items ? order.items.map(item => (
                        <div className={styles.item} key={item._id}>
                            <div className={styles.imageWrapper}>
                                <img src={item.imageUrl} alt="" className={styles.itemImage} />
                            </div>
                            <div className={styles.itemDetails}>
                                <div>
                                    <p className={styles.title}>{item.title}</p>
                                    <div className={styles.author}>by Book author</div>
                                </div>

                                <p className={styles.itemPrice}>$ 33.58</p>

                                <div className={styles.otherItemInfo}>
                                    <p className={styles.row}>Format: <span>{item.format}</span></p>
                                    <p className={styles.row}>Quantity<span>{item.basketQuantity}</span></p>
                                    <p className={styles.row}>Total: <span>$ {item.price * item.basketQuantity}</span></p>
                                </div>
                            </div>
                        </div>
                    )) : null}
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.orderInfo}>
                    <h4>Order address</h4>
                    <p>{order.fullName}</p>
                    <p>{order.address}</p>
                    <p>{order.postalCode}, {order.city}</p>
                </div>
                <div className={styles.orderInfo}>
                    <h4>Contact info</h4>
                    <p>{order.email}</p>
                    <p>{order.phoneNumber}</p>
                </div>
                <div className={styles.orderInfo}>
                    <h4>Payment method</h4>
                    <p>Cash (On delivery)</p>
                </div>
                <div className={`${styles.orderInfo} ${styles.total}`}>
                    <h4>Total</h4>
                    <p>$ {order.totalPrice}</p>
                </div>
            </div>

            <button className={styles.declineOrder} onClick={deleteOrderhandler}>
                Decline order
            </button>
        </div>
    );
}