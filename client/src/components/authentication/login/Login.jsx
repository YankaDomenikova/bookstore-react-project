import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useForm from '../../../hooks/useForm';
import AuthContext from '../../../contexts/AuthContext';
import { Paths } from '../../../paths/paths';

import styles from '../Auth.module.css';
import eyeOpenIcon from '../../../assets/eye-open-solid-svgrepo-com.svg'
import eyeClosedIcon from '../../../assets/eye-close-solid-svgrepo-com.svg'

const formKeys = {
    email: 'email',
    password: 'password'
}

export default function Login() {

    const { loginSubmitHandler } = useContext(AuthContext);
    const { values, onChange, onSubmit, onBlur, errors } = useForm(loginSubmitHandler, {
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
            <button className={`${styles.backBtn} ${styles.backBtnLogin}`} onClick={() => navigate(Paths.Home)}>
                Home
            </button>

            <section className={styles.sideDesign}>
                <img src="design.png" alt="" />
            </section>

            <section className={styles.authSection}>
                <h1 className={styles.formHeading}>Login</h1>

                <form className={styles.authForm} onSubmit={onSubmit} noValidate>
                    <div className={styles.inputWrapper}>
                        <input
                            className={`${styles.formInput} ${errors.email && styles.error}`}
                            type="email"
                            name={formKeys.email}
                            placeholder="Email"
                            id='email'
                            onChange={onChange}
                            value={values[formKeys.email]}
                            onBlur={() => onBlur(formKeys.email)}
                        />
                        <label className={styles.formLabel} htmlFor="email">Email</label>
                    </div>
                    {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}

                    <div className={`${styles.inputWrapper} ${styles.passwordWrapper}`}>
                        <input
                            className={styles.formInput}
                            type={showPassword ? 'text' : 'password'}
                            name={formKeys.password}
                            placeholder="Password"
                            id='password'
                            onChange={onChange}
                            value={values[formKeys.password]}
                        // onBlur={() => onBlur(formKeys.password)}
                        />
                        <label className={styles.formLabel} htmlFor="password">Password</label>
                        <button type="button" className={styles.showPasswordBtn} onClick={showPasswordHandler}>
                            <img src={showPassword ? eyeClosedIcon : eyeOpenIcon} />
                        </button>
                    </div>
                    {/* {errors.password && <p className={styles.errorMessage}>{errors.password}</p>} */}

                    <div className={styles.details}>
                        <div className={styles.rememberMe}>
                            <input type="checkbox" name={styles.rememberMe} />
                            <p>Remember me</p>
                        </div>
                        <Link className={styles.forgotPassword}>Forgot Password?</Link>
                    </div>

                    <input className={styles.loginBtn} type="submit" value="Login" disabled={Object.values(errors).some(x => x !== null)} />
                </form>

                <div className={styles.linkAuth}>
                    <p>No account? <Link to={Paths.Register}>Sign in</Link> </p>
                </div>

            </section>
        </div>
    );
}