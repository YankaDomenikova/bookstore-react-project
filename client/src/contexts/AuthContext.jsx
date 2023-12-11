import { useState, createContext } from "react";
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import usePersistedState from "../hooks/usePersistedState";
const AuthContext = createContext();

AuthContext.displayName = "AuthContext";

export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = usePersistedState("authentication", {});

    const navigate = useNavigate();

    const loginSubmitHandler = async (values) => {
        const result = await authService.login(values.email, values.password);
        setAuthData(result);
        navigate(-1);
    };

    const registerSubmitHandler = async (values) => {
        const result = await authService.register(values.username, values.email, values.password);
        setAuthData(result);
        navigate(-2);
    };

    const logoutHandler = () => {
        setAuthData({});
    }

    const values = {
        loginSubmitHandler,
        userId: authData._id,
        username: authData.username,
        email: authData.email,
        isAuthenticated: !!authData.accessToken,
        registerSubmitHandler,
        logoutHandler
    }

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;