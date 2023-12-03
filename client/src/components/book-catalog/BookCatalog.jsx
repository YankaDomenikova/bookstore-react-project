import BookCatalogItem from './book-catalog-item/BookCatalogItem';

import styles from './BookCatalog.module.css'

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