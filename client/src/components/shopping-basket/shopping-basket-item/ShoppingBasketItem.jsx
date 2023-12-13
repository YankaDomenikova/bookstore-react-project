import styles from './ShoppingBasketItem.module.css';
import plusIcon from '../../../assets/plus-circle-svgrepo-com.svg';
import minIcon from '../../../assets/minus-circle-svgrepo-com.svg';
import removeIcon from '../../../assets/remove-svgrepo-com.svg';
import { useContext } from 'react';
import ShoppingContext from '../../../contexts/ShoppingContext';
export default function ShoppingBasketItem({ _id, title, author, imageUrl, price, basketQuantity }) {
    const { incrementItemQuantity, decrementItemQuantity, removeItem } = useContext(ShoppingContext);
    return (
        <div className={styles.basketItems}>
            <div className={styles.basketItem}>
                <div className={styles.bookInfo}>
                    <img src={imageUrl} alt="" />
                    <div className={styles.bookDetails}>
                        <p className={styles.bookTitle}>{title}</p>
                        <p className={styles.author}>{author}</p>
                        <p className={`${styles.availability} ${styles.inStock}`}>In stock</p>
                    </div>
                </div>

                <div className={styles.quantityControls}>
                    <button className={styles.min} onClick={() => decrementItemQuantity(_id)}>
                        <img src={minIcon} />
                    </button>
                    <p className={styles.qty}>{basketQuantity}</p>
                    <button className={styles.plus} onClick={() => incrementItemQuantity(_id)}>
                        <img src={plusIcon} alt="" />
                    </button>
                </div>

                <div className={styles.priceByQuantity}>$ {price * basketQuantity}</div>

                <button className={styles.remove} onClick={() => removeItem({ _id, title, author, imageUrl, price, basketQuantity })}>
                    <img src={removeIcon} alt="" />
                </button>

            </div>
        </div>
    )
}