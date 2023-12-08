import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

import * as bookService from '../../services/bookService';

import styles from './BookDetails.module.css';
import openBookIcon from '../../assets/book-open-svgrepo-com.svg';
import bookIcon from '../../assets/book-svgrepo-com.svg';
import truck from '../../assets/delivery-truck-with-packages-behind-svgrepo-com.svg';

export default function BookDetails() {
    const [book, setBook] = useState({});
    const { bookId } = useParams();

    useEffect(() => {
        bookService.getBookById(bookId)
            .then(result => setBook(result));

    }, [bookId])

    return (
        <div className={styles.pageContent}>
            <div className={styles.detailsContainer}>
                <div className={styles.imageWrapper}>
                    <img src={book.imageUrl} alt="" />
                </div>
                <div className={styles.details}>
                    <div>
                        <h1 className={styles.bookTitle}>{book.title}</h1>

                        <p className={styles.bookAuthor}><span>by</span> {book.author}</p>
                    </div>

                    <div className={styles.infoOverview}>
                        <img src={openBookIcon} alt="" />
                        <p>{book.format}<br />{book.pages} pages</p>
                        <img src={bookIcon} alt="" style={{ marginLeft: "15px" }} />
                        <p>Dimensions(cm)<br />{book.dimensions}</p>
                    </div>

                    <div>
                        <p className={styles.quantity}>
                            {book.quantity === 0 ? "Out of stock"
                                : book.quantity < 6 ? "Limited quantity"
                                    : "In stock"}
                        </p>

                        <div className={styles.delivery}>
                            <img src={truck} alt="" />
                            <p>Delivery in 3 - 4 work days</p>
                        </div>
                    </div>

                    <h2 className={styles.bookPrice}>$ {book.price}</h2>

                    <button className={styles.addToBasket}>Add to basket</button>
                </div>

                <div className={styles.information}>
                    <h2>Book information</h2>
                    <ul className={styles.bookInfo}>
                        <li>
                            <p>Publisher</p>
                            <p>{book.publisher}</p>
                        </li>
                        <li>
                            <p>Publish date</p>
                            <p>{book.publishDate}</p>
                        </li>
                        <li>
                            <p>Lanuage</p>
                            <p>{book.language}</p>
                        </li>
                        <li>
                            <p>Pages</p>
                            <p>{book.pages}</p>
                        </li>
                        <li>
                            <p>Dimensions(cm)</p>
                            <p>{book.dimensions}</p>
                        </li>
                    </ul>
                </div>

                <div className={styles.description}>
                    <h2>Description</h2>
                    <p>{book.description}</p>
                </div>
            </div>
        </div>
    );
}