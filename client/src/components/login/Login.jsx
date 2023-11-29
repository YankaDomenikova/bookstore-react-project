export default function Login() {
    return (
        <div className="contentContainer">
            <section className="sideDesign">
                <img src="images/Frame 35.png" alt="" />
            </section>

            <section className="authSection">
                <h1 className="formHeading">Login</h1>

                <form action="" className="authForm">
                    <div className="inputWrapper ">
                        <input className="formInput" type="email" name="email" placeholder="Email" autocomplete="off" value="" />
                        <label className="formLabel" for="email">Email</label>
                    </div>
                    <div className="inputWrapper passwordWrapper">
                        <input className="formInput" type="password" name="password" placeholder="Password" value="" />
                        <label className="formLabel" for="password">Password</label>
                        <button type="button" className="showPasswordBtn">
                            <img src="svg/eye-open-solid-svgrepo-com.svg" alt="" />
                        </button>
                    </div>

                    <div className="details">
                        <div className="rememberMe">
                            <input type="checkbox" name="rememberMe" />
                            <p>Remember me</p>
                        </div>
                        <a href="" className="forgotPassword">Forgot Password?</a>
                    </div>

                    <input className="loginBtn" type="submit" value="Login" />
                </form>

                <div className="linkAuth">
                    <p>No account? </p>
                    <a href="" className="">Sign in</a>
                </div>

            </section>
        </div>
    );
}