import { useState } from 'react';

import styles from '../Auth.module.css';

import eyeOpenIcon from '../../../assets/eye-open-solid-svgrepo-com.svg'
import eyeClosedIcon from '../../../assets/eye-close-solid-svgrepo-com.svg'

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    const showPasswordHandler = () => {
        setShowPassword(!showPassword);
    }

    return (
        <div className={styles.contentContainer}>
            <section className={`${styles.authSection} ${styles.registerSection}`}>
                <div className={styles.wrapper}>
                    <h1 className={styles.formHeading}>Register</h1>

                    <form action="" className={styles.authForm}>
                        <div className={`${styles.inputWrapper} ${styles.usernameWrapper}`}>
                            <input className={styles.formInput} type="text" name="username" placeholder="Username" />
                            <label className={styles.formLabel} htmlFor="username">Username</label>
                        </div>
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

                        <input className={styles.loginBtn} type="submit" value="Create account" />
                    </form>

                    <div className={styles.linkAuth}>
                        <p>Already have an account? <a href="">Log in</a> </p>
                    </div>
                </div>
            </section>

            <section className={`${styles.sideDesign} ${styles.register}`}>
                <img src="design.png" alt="" />
            </section>
        </div>
    );
}