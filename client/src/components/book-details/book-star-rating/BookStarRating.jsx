import styles from './BookStarRating.module.css'

export default function BookStarRating({ value }) {
    const percentage = Math.round((value / 5) * 100);

    return (
        <div className={styles.container}>

            {[...Array(5)].map((star, index) => (
                <span key={index} className={styles.star}>&#9733;</span>
            ))}
            <div className={styles.overlay} style={{ width: `${100 - percentage}%` }} />
        </div>
    );
}