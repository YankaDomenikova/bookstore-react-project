import { Link } from 'react-router-dom';
import styles from './BookCatalogItem.module.css';
import { useContext } from 'react';
import ShoppingContext from '../../../contexts/ShoppingContext';

export default function BookCatalogItem({
    _id,
    title,
    author,
    price,
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
                <p className={styles.bookPrice}>$ {price}</p>
            </div>
            <button className={styles.addToBasketBtn} onClick={() => addToBasketHandler({
                _id,
                title,
                author,
                price,
                imageUrl,
            })}>Add to basket</button>
        </div>
    );
}