import { useState } from 'react';
import { Link, useAsyncValue, useNavigate } from 'react-router-dom';

import { Paths } from '../../../paths/paths';

import styles from '../Auth.module.css';
import eyeOpenIcon from '../../../assets/eye-open-solid-svgrepo-com.svg'
import eyeClosedIcon from '../../../assets/eye-close-solid-svgrepo-com.svg'

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const showPasswordHandler = () => {
        setShowPassword(!showPassword);
    }

    return (
        <div className={styles.contentContainer}>
            <button
                className={`${styles.backBtn} ${styles.backBtnLogin}`}
                onClick={() => navigate(-1)}
            >
                Go back
            </button>
            <section className={styles.sideDesign}>
                <img src="design.png" alt="" />
            </section>

            <section className={styles.authSection}>
                <h1 className={styles.formHeading}>Login</h1>

                <form action="" className={styles.authForm}>
                    <div className={styles.inputWrapper}>
                        <input className={styles.formInput} type="email" name="email" placeholder="Email" />
                        <label className={styles.formLabel} htmlFor="email">Email</label>
                    </div>
                    <div className={`${styles.inputWrapper} ${styles.passwordWrapper}`}>
                        <input className={styles.formInput} type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" />
                        <label className={styles.formLabel} htmlFor="password">Password</label>
                        <button type="button" className={styles.showPasswordBtn} onClick={showPasswordHandler}>
                            <img
                                src={showPassword ? eyeClosedIcon : eyeOpenIcon}
                                alt=""
                            />

                        </button>
                    </div>

                    <div className={styles.details}>
                        <div className={styles.rememberMe}>
                            <input type="checkbox" name={styles.rememberMe} />
                            <p>Remember me</p>
                        </div>
                        <a href="" className={styles.forgotPassword}>Forgot Password?</a>
                    </div>

                    <input className={styles.loginBtn} type="submit" value="Login" />
                </form>

                <div className={styles.linkAuth}>
                    <p>No account? <Link to={Paths.Register} class="">Sign in</Link> </p>
                </div>

            </section>
        </div>
    );
}