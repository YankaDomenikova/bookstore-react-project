import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Paths } from '../../paths/paths';
import * as bookService from '../../services/bookService';

import StarRatingDisplay from '../../components/star-rating-display/StarRatingDisplay';
import ShoppingContext from '../../contexts/ShoppingContext';

import styles from './Home.module.css'

export default function Home() {
    const [latestBooks, setLatestBooks] = useState([]);
    const [bookOfTheMonth, setBookOfTheMonth] = useState({});
    const { addToBasketHandler } = useContext(ShoppingContext);

    useEffect(() => {
        try {
            bookService.getLatest()
                .then(result => setLatestBooks(result));

            bookService.getBookOfTheMonth()
                .then(result => setBookOfTheMonth(result[0]));
        } catch (err) {
            console.error(err);
        }
    }, []);

    console.log(bookOfTheMonth);
    return (
        <>
            <div className={styles.banner}>
                <img src="books-cover-2-removebg-preview.png" alt="" />
                <div className={styles.bannerText}>
                    <h1>Books for everyone</h1>
                    <Link to={Paths.Catalog}>Shop now</Link>
                </div>
                <img src="books-cover-3-removebg-preview.png" alt="" />
            </div >

            <div className={styles.pageContent}>
                <section className={styles.container}>
                    <h3 className={styles.heading}>Latest books</h3>
                    <div className={styles.latestBooks}>
                        {latestBooks.map((book) => (
                            <div className={styles.imageWrapper} key={book._id}>
                                <Link to={`catalog/book/${book._id}/details`} >
                                    <img src={book.imageUrl} alt="" className={styles.bookImage} />
                                </Link>
                            </div>
                        ))}

                    </div>
                </section>
                <section className={`${styles.container} ${styles.marginTop}`}>
                    <h3 className={styles.heading}>Book of the month</h3>
                    <div className={styles.bookOfTheMonth}>
                        <Link to={`catalog/book/${bookOfTheMonth._id}/details`}>
                            <img src={bookOfTheMonth.imageUrl} alt="" className={styles.image} />
                        </Link>
                        <div className={styles.bookDetails}>
                            <div>
                                <div className={styles.title}>{bookOfTheMonth.title}</div>
                                <div className={styles.author}>{bookOfTheMonth.author}</div>
                                <StarRatingDisplay size={25} value={bookOfTheMonth.rating} />
                            </div>

                            <div className={styles.price}>${bookOfTheMonth.price}</div>

                            <button className={styles.addTobasket} onClick={() => addToBasketHandler({ ...bookOfTheMonth })}>Add to basket</button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}