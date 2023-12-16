import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AuthContext from "../../../contexts/AuthContext";
import ShoppingContext from "../../../contexts/ShoppingContext";
import * as authService from '../../../services/authService';
import { Paths } from "../../../paths/paths";

export default function Logout() {
    const navigate = useNavigate();

    const { logoutHandler } = useContext(AuthContext);
    const { resetBasket } = useContext(ShoppingContext);

    useEffect(() => {
        authService.logout()
            .then(() => {
                logoutHandler();
                resetBasket()
                navigate(Paths.Home);
            })
            .catch(() => {
                logoutHandler();
                resetBasket();
                navigate(Paths.Login);
            });
    }, [])

    return null;
}