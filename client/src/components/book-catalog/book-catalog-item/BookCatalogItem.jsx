import styles from './BookCatalogItem.module.css';

export default function BookCatalogItem() {
    return (
        <div className={styles.catalogItem}>
            <div className={styles.imageWrapper}>
                <img src="" alt="image" />
            </div>
            <div className={styles.bookDetails}>
                <p className={styles.bookTitle}>Lorem ipsum dolor sit amet consectetur adipisicing elit</p>
                <p className={styles.authorName}>by Author name</p>
                <p className={styles.bookPrice}>$ 20.95</p>
            </div>
            <button className={styles.addToBasketBtn}>Add to basket</button>
        </div>
    );
}