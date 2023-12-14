import { useContext } from "react";
import { Link } from 'react-router-dom';

import ShoppingContext from "../../contexts/ShoppingContext";

import styles from './Checkout.module.css';

export default function Checkout({ }) {
    const { totalPrice } = useContext(ShoppingContext);
    return (
        <div className={styles.pageContent}>
            Checkout
        </div>
    );
}