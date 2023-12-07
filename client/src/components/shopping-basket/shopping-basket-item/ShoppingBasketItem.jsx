import styles from './ShoppingBasketItem.module.css';
import plusIcon from '../../../assets/plus-circle-svgrepo-com.svg';
import minIcon from '../../../assets/minus-circle-svgrepo-com.svg';
import removeIcon from '../../../assets/remove-svgrepo-com.svg';
export default function ShoppingBasketItem() {
    return (
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
    )
}