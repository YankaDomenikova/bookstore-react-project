import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';


import * as bookService from '../../../services/bookService';

import BookCatalogItem from '../book-catalog-item/BookCatalogItem';

import styles from '../BookCatalog.module.css';

export default function Bestsellers() {
    const [bestsellers, setBestsellers] = useState([]);

    useEffect(() => {
        try {
            bookService.getBestsellers()
                .then(result => setBestsellers(result));
        } catch (error) {
            toast.error(error);
        }
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