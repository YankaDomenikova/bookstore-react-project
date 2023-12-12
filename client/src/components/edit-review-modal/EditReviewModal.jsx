import { useNavigate } from 'react-router-dom';

import StarRatingInput from '../star-rating-input/StarRatingInput';

import styles from './EditReviewModal.module.css';
import closeIcon from '../../assets/remove-svgrepo-com.svg';

export default function EditReviewModal({ }) {
    const navigate = useNavigate();

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.modalContent}>
                    <button className={styles.closeBtn} onClick={() => navigate(-1)}>
                        <img src={closeIcon} alt="" />
                    </button>

                    <h3>Edit review</h3>

                    <form>
                        <StarRatingInput size={25} />

                        <textarea name="" id="" cols="30" rows="10"></textarea>
                    </form>

                    <div className={styles.buttons}>
                        <button className={styles.cancelBtn} onClick={() => navigate(-1)}>Cancel</button>
                        <button className={styles.saveBtn} onClick={() => console.log("Save")}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
}