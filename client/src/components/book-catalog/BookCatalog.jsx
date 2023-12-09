import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import * as bookService from '../../services/bookService';
import * as categoryService from '../../services/categoryService';

import BookCatalogItem from './book-catalog-item/BookCatalogItem';

import styles from './BookCatalog.module.css'
import filtersIcon from '../../assets/filter-options-preferences-settings-svgrepo-com.svg';

export default function BookCatalog() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const { categoryId, categoryName } = useParams();

    useEffect(() => {
        bookService.getAllBooks()
            .then(result => setBooks(result));

        categoryService.getAllCategories()
            .then(result => setCategories(result));
    }, []);

    const filteredBooks = categoryId
        ? books.filter(book => book._categoryId === categoryId)
        : books;

    return (
        <div className={styles.content}>
            <div className={styles.filtersContainer}>
                <div className={styles.filterHeading}>
                    <img src={filtersIcon} alt="" />
                    <h3>Categories</h3>
                </div>

                <div className={styles.categories}>
                    <ul>
                        <li>
                            <Link to={"/catalog"}>All Books</Link>
                        </li>

                        {categories.map(cat =>
                            <li key={cat._id}>
                                <Link to={`/catalog/${cat._id}/${cat.name}`}>{cat.name}</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            <div className={styles.catalogContainer}>


                <h2 className={styles.bookHeading}>
                    {categoryId ? categoryName : "All Books"}
                </h2>

                <div className={styles.books}>
                    {filteredBooks.map(book => <BookCatalogItem key={book._id} {...book} />)}
                </div>

                {filteredBooks.length === 0 && (
                    <h3 className={styles.noBooksMessage}>
                        {categoryId ? " No books in this category" : "No books yet"}
                    </h3>
                )}

            </div>
        </div>


    );
}