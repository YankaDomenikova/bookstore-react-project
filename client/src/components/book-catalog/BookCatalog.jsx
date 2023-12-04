import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import BookCatalogItem from './book-catalog-item/BookCatalogItem';

import styles from './BookCatalog.module.css'
import filtersIcon from '../../assets/filter-options-preferences-settings-svgrepo-com.svg';

export default function BookCatalog() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3030/data/books?select=_id,title,author,price,imageUrl")
            .then(res => res.json())
            .then(data => setBooks(data));

        fetch("http://localhost:3030/data/categories")
            .then(res => res.json())
            .then(data => setCategories(data));
    }, []);



    return (

        <div className={styles.content}>
            <div className={styles.filtersContainer}>
                <div className={styles.filterHeading}>
                    <img src={filtersIcon} alt="" />
                    <h3>Categories</h3>
                </div>
                <div className={styles.categories}>
                    <ul>
                        {categories.map(cat => <li key={cat._id}>
                            <Link to='/'>{cat.name}</Link>
                        </li>)}
                    </ul>
                </div>
            </div>

            <div className={styles.catalogContainer}>
                <h2 className={styles.bookHeading}>All books</h2>
                <div className={styles.books}>
                    {books.map(book => <BookCatalogItem key={book._id} {...book} />)}
                </div>
            </div>
        </div>


    );
}