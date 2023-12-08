import { Link } from 'react-router-dom';
import styles from './BookCatalogItem.module.css';

export default function BookCatalogItem({
    _id,
    title,
    author,
    price,
    imageUrl,
}) {
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
            <button className={styles.addToBasketBtn}>Add to basket</button>
        </div>
    );
}