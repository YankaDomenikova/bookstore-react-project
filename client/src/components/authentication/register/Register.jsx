import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useForm from '../../../hooks/useForm';
import AuthContext from '../../../contexts/AuthContext';
import { Paths } from '../../../paths/paths';

import styles from '../Auth.module.css';
import eyeOpenIcon from '../../../assets/eye-open-solid-svgrepo-com.svg'
import eyeClosedIcon from '../../../assets/eye-close-solid-svgrepo-com.svg'

const formKeys = {
    username: 'username',
    email: 'email',
    password: 'password'
}

export default function Register() {
    const { registerSubmitHandler } = useContext(AuthContext);

    const { values, onChange, onSubmit } = useForm(registerSubmitHandler, {
        [formKeys.username]: '',
        [formKeys.email]: '',
        [formKeys.password]: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const showPasswordHandler = () => {
        setShowPassword(!showPassword);
    }

    return (
        <div className={styles.contentContainer}>
            <button
                className={`${styles.backBtn} ${styles.backBtnRegister}`}
                onClick={() => navigate(-1)}
            >
                Go back
            </button>

            <section className={`${styles.authSection} ${styles.registerSection}`}>
                <div className={styles.wrapper}>
                    <h1 className={styles.formHeading}>Register</h1>

                    <form className={styles.authForm} onSubmit={onSubmit}>
                        <div className={`${styles.inputWrapper} ${styles.usernameWrapper}`}>
                            <input
                                className={styles.formInput}
                                type="text"
                                onChange={onChange}
                                name={formKeys.username}
                                value={values[formKeys.username]}
                                placeholder="Username"
                            />
                            <label className={styles.formLabel} htmlFor="username">Username</label>
                        </div>
                        <div className={styles.inputWrapper}>
                            <input
                                className={styles.formInput}
                                type="email"
                                onChange={onChange}
                                name={formKeys.email}
                                value={values[formKeys.email]}
                                placeholder="Email"
                            />
                            <label className={styles.formLabel} htmlFor="email">Email</label>
                        </div>
                        <div className={`${styles.inputWrapper} ${styles.passwordWrapper}`}>
                            <input
                                className={styles.formInput}
                                type={showPassword ? 'text' : 'password'}
                                onChange={onChange}
                                name={formKeys.password}
                                value={values[formKeys.password]}
                                placeholder="Password"
                            />
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
                        <p>Already have an account? <Link to={Paths.Login}>Log in</Link> </p>
                    </div>
                </div>
            </section>

            <section className={`${styles.sideDesign} ${styles.register}`}>
                <img src="design.png" alt="" />
            </section>
        </div>
    );
}