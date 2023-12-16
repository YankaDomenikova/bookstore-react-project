import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import AuthContext from '../../contexts/AuthContext';
import * as orderService from '../../services/orderService';
import { convert } from '../../utils/dateConverter';

import styles from './Profile.module.css'
import arrowRight from '../../assets/arrow-right-svgrepo-com.svg';

export default function Profile() {
    const [orders, setOrders] = useState([]);
    const { userId, username, email } = useContext(AuthContext);

    useEffect(() => {
        try {
            orderService.getAll(userId)
                .then(result => setOrders(result));

        } catch (error) {
            toast.error(error);
        }
    }, []);

    return (

        <div className={styles.pageContent}>
            <div className={styles.authinfo}>
                <h3>{username}</h3>
                <p>{email}</p>
            </div>

            <div className={styles.nav}>
                <h5 className={styles.navItem}>My orders</h5>
            </div>

            <div className={styles.ordersContainer}>
                {orders.length === 0 && <h3 className={styles.noOrdersText}>No orders yet</h3>}

                {orders.map(order => (
                    <div className={styles.order} key={order._id}>
                        <div className={styles.orderOverview}>
                            <p className={styles.orderNumber}>{order.orderNumber}</p>
                            <div>
                                <p>$ {order.totalPrice}</p>
                                <p>{convert(order._createdOn)}</p>
                            </div>
                        </div>
                        <Link className={styles.arrow} to={`/order/${order._id}/details`}>
                            <img src={arrowRight} alt="" />
                        </Link>
                    </div>
                ))}

            </div>
        </div >
    );
}