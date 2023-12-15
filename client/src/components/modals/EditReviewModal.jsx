import StarRatingInput from '../star-rating-input/StarRatingInput';

import * as reviewService from '../../services/reviewService';

import styles from './Modal.module.css';
import closeIcon from '../../assets/remove-svgrepo-com.svg';
import useForm from '../../hooks/useForm';


const formKeys = {
    text: 'text',
    rating: 'rating'
}

export default function EditReviewModal({ show, toggleShow, _id, text, rating, bookId }) {

    const editreviewHandler = async (values) => {
        await reviewService.edit(_id, values.text, values.rating, bookId);
        toggleShow();
    }

    const { values, onChange, onSubmit } = useForm(editreviewHandler, {
        [formKeys.text]: text,
        [formKeys.rating]: rating,
    });

    return (
        <div className={styles.overlay} style={{ display: show ? "block" : "none" }}>
            <div className={styles.modal}>
                <div className={styles.modalContent}>
                    <button className={styles.closeBtn} onClick={toggleShow}>
                        <img src={closeIcon} alt="" />
                    </button>

                    <h3>Edit review - modals folder</h3>

                    <form onSubmit={onSubmit}>
                        <StarRatingInput
                            size={25}
                            name={formKeys.rating}
                            value={values[formKeys.rating]}
                            onChange={onChange}
                        />
                        <textarea
                            name={[formKeys.text]}
                            id=""
                            cols="30"
                            rows="10"
                            value={values[formKeys.text]}
                            onChange={onChange}
                        >
                        </textarea>

                        <div className={styles.buttons}>
                            <button type='button' className={styles.cancelBtn} onClick={toggleShow}>Cancel</button>
                            <input type="submit" className={styles.saveBtn} value="Save" />
                        </div>
                    </form>
                </div>
            </div>
        </div >
    );
}