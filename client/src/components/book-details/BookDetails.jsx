import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

import * as bookService from '../../services/bookService';
import * as reviewService from '../../services/reviewService';

import styles from './BookDetails.module.css';
import openBookIcon from '../../assets/book-open-svgrepo-com.svg';
import bookIcon from '../../assets/book-svgrepo-com.svg';
import truck from '../../assets/delivery-truck-with-packages-behind-svgrepo-com.svg';
import editIcon from '../../assets/edit-svgrepo-com.svg';
import deleteIcon from '../../assets/trash-1-svgrepo-com.svg';
import useForm from "../../hooks/useForm";

const formKeys = {
    reviewText: 'reviewText'
}

export default function BookDetails() {
    const [book, setBook] = useState({});
    const [reviews, setReviews] = useState([]);
    const { bookId } = useParams();

    useEffect(() => {
        bookService.getBookById(bookId)
            .then(result => setBook(result));

        reviewService.getAllReviews(bookId)
            .then(result => setReviews(result))
            .catch((err) => console.error(err));


    }, [bookId]);

    const createReviewHandler = async (data) => {
        const result = await reviewService.create(data.reviewText, bookId);
        setReviews(state => ([
            ...state,
            result
        ]));
        console.log(result);
    }

    const { values, onChange, onSubmit } = useForm(createReviewHandler, {
        [formKeys.reviewText]: ''
    });

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
            <div className={styles.reviewsContainer}>
                <form className={styles.writeReview} onSubmit={onSubmit}>
                    <h2>Write a review</h2>

                    <div className={styles.inputs}>

                        <div className={styles.stars}>★★★★★</div>

                        <textarea
                            name={formKeys.reviewText}
                            id=""
                            cols="30"
                            rows="10"
                            placeholder="Share your thoughts..."
                            value={values[formKeys.reviewText]}
                            onChange={onChange}
                        ></textarea>

                        <button className={styles.sendReview}>Send revirew</button>
                    </div>
                </form>

                <div className={styles.reviewList}>
                    <h2>Reviews</h2>

                    {reviews.map(review => (
                        <div className={styles.review} key={review._id}>
                            <h4 className={styles.username}>Username (me)</h4>
                            <p className={styles.reviewText}>{review.reviewText}</p>

                            <div className={styles.reviewInfo}>
                                <div className={styles.starRating}>
                                    <div >★★★★★</div>
                                    <div className={styles.rating}>★★</div>
                                </div>
                                <div className={styles.reviewDate}>{review._createdOn}</div>
                                <div className={styles.reviewControlls}>
                                    <button>
                                        <img src={editIcon} alt="" />
                                    </button>
                                    <button>
                                        <img src={deleteIcon} alt="" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {reviews.length === 0 && <p>No reviews yet</p>}
                </div>
            </div>

        </div>
    );
}