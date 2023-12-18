import { useContext, useEffect, useState } from "react"
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from 'react-hot-toast';

import * as bookService from '../../services/bookService';
import * as reviewService from '../../services/reviewService';
import useForm from "../../hooks/useForm";
import useModal from "../../hooks/useModal";
import AuthContext from "../../contexts/AuthContext";
import { Paths } from "../../paths/paths";
import { convert } from "../../utils/dateConverter";
import { calculate } from "../../utils/ratingCalculator";

import StarRatingDisplay from '../star-rating-display/StarRatingDisplay';
import StarRatingInput from "../star-rating-input/StarRatingInput";
import EditReviewModal from "../modals/EditReviewModal";
import ShoppingContext from "../../contexts/ShoppingContext";
import QuantityText from "../quantity-text/QuantityText";

import styles from './BookDetails.module.css';
import openBookIcon from '../../assets/book-open-svgrepo-com.svg';
import bookIcon from '../../assets/book-svgrepo-com.svg';
import truck from '../../assets/delivery-truck-with-packages-behind-svgrepo-com.svg';
import editIcon from '../../assets/edit-svgrepo-com.svg';
import deleteIcon from '../../assets/trash-1-svgrepo-com.svg';
import awardIcon from '../../assets/pin-award-svgrepo-com.svg';

const formKeys = {
    text: 'text',
    rating: 'rating'
}

export default function BookDetails() {
    const [book, setBook] = useState({});
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const { show, toggleShow } = useModal();
    const { userId, username, isAuthenticated } = useContext(AuthContext);
    const { bookId } = useParams();
    const { addToBasketHandler } = useContext(ShoppingContext);

    useEffect(() => {
        try {
            bookService.getBookById(bookId)
                .then(result => setBook(result));

            reviewService.getAllReviews(bookId)
                .then(result => {
                    setReviews(result);
                    updateBookRating(result);
                });
        } catch (error) {
            toast.error(error);
        }

    }, [bookId]);

    const createReviewHandler = async (data) => {
        const review = await reviewService.create(data.text, data.rating, bookId);
        review.author = { username: username };
        setReviews(state => ([...state, review]));
    }


    const { values, onChange, onSubmit, onBlur, errors } = useForm(createReviewHandler, {
        [formKeys.text]: '',
        [formKeys.rating]: 0
    });

    const updateBookRating = (reviews) => {
        const ratings = reviews.map(r => Number(r.rating));
        let newRating = calculate(ratings);
        setRating(newRating);
    }



    const deleteReviewHandler = async (id) => {
        await reviewService.deleteReview(id);
        setReviews(state => state.filter(r => r._id !== id));
        toast.success("Review deleted")
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
                            <StarRatingDisplay value={rating} size="25" />

                            <div className={styles.totalRating}>
                                <p>{rating}<span className={styles.ratingsCount}> ({reviews.length})</span></p>
                            </div>
                        </div>
                    </div>

                    {book.isBestseller && <div className={styles.bestseller}>
                        <img src={awardIcon} alt="" />
                        <p>Bestseller</p>
                    </div>}

                    <div className={styles.infoOverview}>
                        <img src={openBookIcon} alt="" />
                        <p>{book.format}<br />{book.pages} pages</p>
                        <img src={bookIcon} alt="" style={{ marginLeft: "15px" }} />
                        <p>Dimensions(cm)<br />{book.dimensions}</p>
                    </div>

                    <div>
                        <div className={styles.quantity}>
                            <QuantityText quantity={book.quantity} />
                        </div>

                        {book.quantity > 0 && <div className={styles.delivery}>
                            <img src={truck} alt="" />
                            <p>Delivery in 3 - 4 work days</p>
                        </div>}
                    </div>

                    <h2 className={styles.bookPrice}>$ {book.price}</h2>
                    <button
                        className={book.quantity === 0 ? styles.disabled : styles.addToBasket}
                        onClick={() => addToBasketHandler({ ...book })}
                        disabled={book.quantity === 0}
                    >
                        Add to basket
                    </button>
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
                            <p>{convert(book.publishDate)}</p>
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
                        <div className={styles.starRating}>
                            <StarRatingInput name={formKeys.rating} value={values[formKeys.rating]} onChange={onChange} onBlur={onBlur} />

                            {!isAuthenticated && <p className={styles.loginMessage}>Only logged users can write a review. <Link to={Paths.Login}>Log in</Link> to your account.</p>}
                            {/* {errors.required && <p className={styles.errorMessage}>{errors.required}</p>} */}
                        </div>

                        {errors.rating && <p className={styles.errorMessage}>{errors.rating}</p>}

                        <textarea
                            className={(errors.text || errors.required) && styles.error}
                            name={formKeys.text}
                            id=""
                            cols="30"
                            rows="10"
                            placeholder="Share your thoughts..."
                            value={values[formKeys.text]}
                            onChange={onChange}
                            onBlur={() => onBlur(formKeys.text)}
                        >
                        </textarea>
                        {errors.text && <p className={styles.errorMessage}>{errors.text}</p>}


                        <input type="submit" className={styles.sendReview} value="Send revirew" disabled={Object.values(errors).some(x => x !== null) || !isAuthenticated} />
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
                                    <StarRatingDisplay value={review.rating} size="16" />
                                </div>

                                <div className={styles.reviewDate}>{convert(review._createdOn)}</div>

                                {review._ownerId === userId && (
                                    <div className={styles.reviewControlls}>
                                        <button onClick={toggleShow}>
                                            <img src={editIcon} alt="" />
                                        </button>
                                        <EditReviewModal show={show} toggleShow={toggleShow} {...review} />

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
