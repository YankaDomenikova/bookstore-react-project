import { Link, useParams } from "react-router-dom";
import styles from './OrderSuccess.module.css';
import checkIcon from '../../assets/checkmark-circle-svgrepo-com.svg';
import { Paths } from "../../paths/paths";

export default function OrderSuccess() {
    const { orderNumber } = useParams();


    return (
        <div className={styles.pageContent}>
            <img src={checkIcon} alt="" className={styles.checkIcon} />
            <h1 className={styles.mainHeading}>Thank you for your purchase</h1>
            <h3 className={styles.orderNumber}>Your order number is <Link to={Paths.Profile}>{orderNumber}</Link></h3>
            <button className={styles.continueShopping}>
                <Link to={Paths.Catalog}>
                    Continue shopping
                </Link>
            </button>
        </div>
    );
}