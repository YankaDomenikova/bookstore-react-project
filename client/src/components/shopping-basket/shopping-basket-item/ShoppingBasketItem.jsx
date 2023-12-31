import { useContext } from 'react';
import { Link } from 'react-router-dom';

import ShoppingContext from '../../../contexts/ShoppingContext';
import { round } from '../../../utils/numberRounder';

import styles from './ShoppingBasketItem.module.css';
import plusIcon from '../../../assets/plus-circle-svgrepo-com.svg';
import minIcon from '../../../assets/minus-circle-svgrepo-com.svg';
import removeIcon from '../../../assets/remove-svgrepo-com.svg';

export default function ShoppingBasketItem({ _id, title, author, imageUrl, price, basketQuantity }) {
    const { updateItemQuantity, removeItem } = useContext(ShoppingContext);
    return (
        <div className={styles.basketItems}>
            <div className={styles.basketItem}>
                <div className={styles.bookInfo}>
                    <Link to={`/catalog/book/${_id}/details`}>
                        <img src={imageUrl} alt="" />
                    </Link>
                    <div className={styles.bookDetails}>
                        <p className={styles.bookTitle}>{title}</p>
                        <p className={styles.author}>{author}</p>
                        <p className={`${styles.availability} ${styles.inStock}`}>In stock</p>
                    </div>
                </div>

                <div className={styles.quantityControls}>
                    <button className={styles.min} onClick={() => updateItemQuantity("decrement", _id)}>
                        <img src={minIcon} />
                    </button>
                    <p className={styles.qty}>{basketQuantity}</p>
                    <button className={styles.plus} onClick={() => updateItemQuantity("increment", _id)}>
                        <img src={plusIcon} alt="" />
                    </button>
                </div>

                <div className={styles.priceByQuantity}>$ {round(price * basketQuantity)}</div>

                <button className={styles.remove} onClick={() => removeItem({ _id, title, author, imageUrl, price, basketQuantity })}>
                    <img src={removeIcon} alt="" />
                </button>

            </div>
        </div>
    )
}