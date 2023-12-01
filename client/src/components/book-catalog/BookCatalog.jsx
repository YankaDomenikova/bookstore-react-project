import styles from './BookCatalog.module.css'
import BookCatalogItem from './book-catalog-item/BookCatalogItem';

export default function BookCatalog() {
    return (
        <div className={styles.catalogContainer}>
            <BookCatalogItem />
            <BookCatalogItem />
            <BookCatalogItem />
            <BookCatalogItem />
            <BookCatalogItem />
            <BookCatalogItem />
            <BookCatalogItem />
            <BookCatalogItem />
        </div>
    );
}