import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import BookCatalogItem from './book-catalog-item/BookCatalogItem';

import styles from './BookCatalog.module.css'
import filtersIcon from '../../assets/filter-options-preferences-settings-svgrepo-com.svg';

export default function BookCatalog() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const { categoryName, categoryId, } = useParams();


    let url;
    if (categoryId && categoryName) {
        url = `http://localhost:3030/data/books?select=_id,title,author,price,imageUrl&where=_categoryId%3D%22${categoryId}%22`;
    } else {
        //url = "http://localhost:3030/data/books?select=_id,title,author,price,imageUrl&load=gategory%3D_categoryId%3Acategories";
        url = "http://localhost:3030/data/books?select=_id%2Ctitle%2Cauthor%2Cprice%2CimageUrl%2C_categoryId&load=category%3D_categoryId%3Acategories";
    }

    useEffect(() => {

        fetch(url)
            .then(res => res.json())
            .then(data => setBooks(data));

        fetch("http://localhost:3030/data/categories")
            .then(res => res.json())
            .then(data => setCategories(data));
    }, [categoryId]);

    return (

        <div className={styles.content}>
            <div className={styles.filtersContainer}>
                <div className={styles.filterHeading}>
                    <img src={filtersIcon} alt="" />
                    <h3>Categories</h3>
                </div>
                <div className={styles.categories}>
                    <ul>
                        <li><Link to={"/catalog"}>All Books</Link></li>
                        {categories.map(cat => <li key={cat._id}>
                            <Link to={`/catalog/${cat.name}/${cat._id}`}>{cat.name}</Link>
                        </li>)}
                    </ul>
                </div>
            </div>

            <div className={styles.catalogContainer}>
                <h2 className={styles.bookHeading}>
                    {categoryId ? categoryName : "All "} Books
                </h2>
                <div className={styles.books}>
                    {books.map(book => <BookCatalogItem key={book._id} {...book} />)}
                </div>

                {books.length === 0 && (
                    <h3 className={styles.noBooksMessage}> No books in this category</h3>
                )}
            </div>
        </div>


    );
}