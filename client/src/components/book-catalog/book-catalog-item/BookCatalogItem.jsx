import { Link } from 'react-router-dom';
import styles from './BookCatalogItem.module.css';
import { useContext } from 'react';
import ShoppingContext from '../../../contexts/ShoppingContext';
import QuantityText from '../../quantity-text/QuantityText';

export default function BookCatalogItem({
    _id,
    title,
    author,
    quantity,
    price,
    format,
    imageUrl,
}) {

    const { addToBasketHandler } = useContext(ShoppingContext);

    return (
        <div className={styles.catalogItem}>
            <div className={styles.imageWrapper}>
                <Link to={`/catalog/book/${_id}/details`} >
                    <img src={imageUrl} alt="image" />
                </Link>
            </div>
            <div className={styles.bookDetails}>
                <p className={styles.bookTitle}>{title}</p>
                <p className={styles.authorName}>by {author}</p>
                <div className={styles.bookQuantity}>
                    <QuantityText quantity={quantity} />
                </div>
                <p className={styles.bookPrice}>$ {price}</p>
            </div>
            <button
                className={quantity === 0 ? styles.disabled : styles.addToBasketBtn}
                disabled={quantity === 0}
                onClick={() => addToBasketHandler({
                    _id,
                    title,
                    author,
                    quantity,
                    price,
                    format,
                    imageUrl,
                })}>Add to basket</button>
        </div>
    );
}