import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

import * as bookService from '../../services/bookService';

import styles from './BookDetails.module.css';
import openBookIcon from '../../assets/book-open-svgrepo-com.svg';
import bookIcon from '../../assets/book-svgrepo-com.svg';
import truck from '../../assets/delivery-truck-with-packages-behind-svgrepo-com.svg';
import editIcon from '../../assets/edit-svgrepo-com.svg';
import deleteIcon from '../../assets/trash-1-svgrepo-com.svg';


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
            <div class={styles.reviewsContainer}>
                <form class={styles.writeReview}>
                    <h2>Write a review</h2>

                    <div class={styles.inputs}>

                        <div class={styles.stars}>★★★★★</div>

                        <textarea name="" id="" cols="30" rows="10" placeholder="Share your thoughts..."></textarea>

                        <button class={styles.sendReview}>Send revirew</button>
                    </div>
                </form>

                <div class={styles.reviewList}>
                    <h2>Reviews</h2>

                    <div class={styles.review}>
                        <h4 class={styles.username}>Username {/*(me)*/}</h4>
                        <p class={styles.reviewText}>
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quidem ipsa, odio iure hic repellendus laudantium impedit perferendis magnam sequi assumenda dignissimos unde voluptatibus fugit aut pariatur animi eligendi deleniti expedita.
                            Totam, praesentium? Voluptatibus accusamus qui aliquid iendis.
                        </p>

                        <div className={styles.reviewInfo}>
                            <div class={styles.starRating}>
                                <div >★★★★★</div>
                                <div class={styles.rating}>★★</div>
                            </div>
                            <div class={styles.reviewDate}>28 June 2022</div>
                            {/* <div className={styles.reviewControlls}>
                                <button>
                                    <img src={editIcon} alt="" />
                                </button>
                                <button>
                                    <img src={deleteIcon} alt="" />
                                </button>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}