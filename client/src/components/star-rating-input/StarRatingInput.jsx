import { useState } from "react";
import styles from './StarRatingInput.module.css';

export default function StarRatingInput({ name, value, onChange }) {
    const [hover, setHover] = useState(0);

    return (
        <div>
            {[...Array(5)].map((star, index) => {
                const currentRating = index + 1;
                return (
                    <label key={index}>
                        <input
                            type="radio"
                            name={name}
                            value={currentRating}
                            onChange={onChange}
                            checked={value === currentRating}
                        />
                        <span
                            className={styles.star}
                            style={{ color: currentRating <= (hover || value) ? "#C80D44" : "#e4e5e9" }}
                            onMouseEnter={() => setHover(currentRating)}
                            onMouseLeave={() => setHover(null)}
                        >
                            &#9733;
                        </span>
                    </label>
                );
            })}
        </div>

    );
}