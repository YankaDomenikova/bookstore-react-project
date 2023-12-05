import { useEffect, useState } from 'react';
import styles from '../BookCatalog.module.css';
import BookCatalogItem from '../book-catalog-item/BookCatalogItem';

export default function Bestsellers() {
    const [bestsellers, setBestsellers] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3030/data/books?select=_id,title,author,price,imageUrl&where=isBestseller%3Dtrue")
            .then(res => res.json())
            .then(data => setBestsellers(data));
    }, []);

    return (
        <div>
            <div className={styles.content}>


                <div className={styles.catalogContainer}>
                    <h2 className={styles.bookHeading}>
                        Bestsellers
                    </h2>
                    <div className={styles.books}>
                        {bestsellers.map(bestseller => <BookCatalogItem key={bestseller._id} {...bestseller} />)}
                    </div>

                    {bestsellers.length === 0 && (
                        <h3 className={styles.noBooksMessage}> No bestsellers yet.</h3>
                    )}
                </div>
            </div>
        </div>
    )
}