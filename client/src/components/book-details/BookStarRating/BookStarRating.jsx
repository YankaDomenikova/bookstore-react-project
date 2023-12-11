import styles from './BookStarRating.module.css'

export default function BookStarRating({ value }) {
    /* Calculate how much of the stars should be "filled" */
    const percentage = Math.round((value / 5) * 100);

    return (
        <div className={styles.container}>
            {
                /* Create an array based on the max rating, render a star for each */
            }
            {Array.from(Array(5).keys()).map((_, i) => (
                <span key={i} className={styles.star}>&#9733;</span>
            ))}
            {
                /* Render a div overlayed on top of the stars that should not be not filled */
            }
            <div className={styles.overlay} style={{ width: `${100 - percentage}%` }} />
        </div>
    );
}