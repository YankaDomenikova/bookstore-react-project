import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";

import * as bookService from '../../services/bookService';
import * as reviewService from '../../services/reviewService';
import useForm from "../../hooks/useForm";
import AuthContext from "../../contexts/AuthContext";
import { Paths } from "../../paths/paths";
import { convert } from "../../utils/dateConverter";
import { calculate } from "../../utils/ratingCalculator";

import BookStarRating from "./book-star-rating/BookStarRating";

import styles from './BookDetails.module.css';
import openBookIcon from '../../assets/book-open-svgrepo-com.svg';
import bookIcon from '../../assets/book-svgrepo-com.svg';
import truck from '../../assets/delivery-truck-with-packages-behind-svgrepo-com.svg';
import editIcon from '../../assets/edit-svgrepo-com.svg';
import deleteIcon from '../../assets/trash-1-svgrepo-com.svg';

const formKeys = {
    text: 'text',
    rating: 'rating'
}

export default function BookDetails() {
    const [book, setBook] = useState({});
    const [reviews, setReviews] = useState([]);
    const [hover, setHover] = useState(0);
    const [rating, setRating] = useState(0);
    const { userId, username, isAuthenticated } = useContext(AuthContext);
    const { bookId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        bookService.getBookById(bookId)
            .then(result => setBook(result));

        reviewService.getAllReviews(bookId)
            .then(result => {
                setReviews(result);
                updateBookRating(result);
            });
    }, [bookId]);


    const createReviewHandler = async (data) => {
        if (isAuthenticated) {
            const review = await reviewService.create(data.text, data.rating, bookId);
            review.author = { username: username };
            setReviews(state => ([...state, review]));
            updateBookRating(reviews);
        } else {
            navigate(Paths.Login);
        }
    }

    const updateBookRating = (reviews) => {
        const ratings = reviews.map(r => Number(r.rating));
        let newRating = calculate(ratings);
        setRating(newRating);
    }

    const { values, onChange, onSubmit } = useForm(createReviewHandler, {
        [formKeys.text]: '',
        [formKeys.rating]: 0
    });

    const deleteReviewHandler = async (id) => {
        await reviewService.deleteReview(id);
        setReviews(state => state.filter(r => r._id !== id));
    };


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

                        <div className={styles.ratingOverview}>
                            <BookStarRating value={rating} />
                            <div className={styles.totalRating}>
                                <p>{rating}<span className={styles.ratingsCount}> ({reviews.length})</span></p>
                            </div>
                        </div>
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
                        <div>
                            {[...Array(5)].map((star, index) => {
                                const currentRating = index + 1;
                                return (
                                    <label key={index}>
                                        <input
                                            type="radio"
                                            name={formKeys.rating}
                                            value={currentRating}
                                            onChange={onChange}
                                            checked={values[formKeys.rating] === currentRating}
                                        />
                                        <span
                                            className={styles.star}
                                            style={{ color: currentRating <= (hover || values[formKeys.rating]) ? "#C80D44" : "#e4e5e9" }}
                                            onMouseEnter={() => setHover(currentRating)}
                                            onMouseLeave={() => setHover(null)}
                                        >
                                            &#9733;
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        <textarea
                            name={formKeys.text}
                            id=""
                            cols="30"
                            rows="10"
                            placeholder="Share your thoughts..."
                            value={values[formKeys.text]}
                            onChange={onChange}
                        >
                        </textarea>

                        <input type="submit" className={styles.sendReview} value="Send revirew" />
                    </div>
                </form>

                <div className={styles.reviewList}>
                    <h2>Reviews</h2>

                    {reviews.map(review => (
                        <div className={styles.review} key={review._id}>
                            <h4 className={styles.username}>
                                {review.author.username}
                                {review._ownerId === userId && " (me)"}

                            </h4>
                            <p className={styles.reviewText}>{review.text}</p>

                            <div className={styles.reviewInfo}>
                                <div className={styles.starRating}>
                                    {[...Array(5)].map((star, index) => (
                                        <span
                                            key={index}
                                            style={{ color: index < (review.rating) ? "#C80D44" : "#e4e5e9" }}
                                        >
                                            &#9733;
                                        </span>
                                    ))}
                                </div>

                                <div className={styles.reviewDate}>{convert(review._createdOn)}</div>

                                {review._ownerId === userId && (
                                    <div className={styles.reviewControlls}>
                                        <button>
                                            <img src={editIcon} alt="" />
                                        </button>
                                        <button onClick={() => deleteReviewHandler(review._id)}>
                                            <img src={deleteIcon} alt="" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {reviews.length === 0 && <p>No reviews yet</p>}
                </div>
            </div>

        </div>
    );
}