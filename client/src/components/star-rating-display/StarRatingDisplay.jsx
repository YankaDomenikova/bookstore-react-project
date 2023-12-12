import styles from './StarRatingDisplay.module.css'

export default function BookStarRating({ value, size }) {
    const percentage = Math.round((value / 5) * 100);

    return (
        <div className={styles.container}>

            {[...Array(5)].map((star, index) => (
                <span
                    key={index}
                    className={styles.star}
                    style={{ fontSize: `${size}px` }}
                >
                    &#9733;
                </span>
            ))}
            <div className={styles.overlay} style={{ width: `${100 - percentage}%` }} />
        </div>
    );
}