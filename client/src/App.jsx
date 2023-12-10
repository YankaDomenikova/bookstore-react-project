import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import * as authService from './services/authService';
import AuthContext from './contexts/AuthContext';
import { Paths } from './paths/paths';

import Home from "./components/home/Home";
import BookCatalog from "./components/book-catalog/BookCatalog";
import BookDetails from './components/book-details/BookDetails';
import Bestsellers from './components/book-catalog/bestsellers/Bestsellers';
import ShoppingBasket from './components/shopping-basket/ShoppingBasket';
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import Logout from './components/authentication/logout/Logout';
import NotFound from "./components/not-found/NotFound";
import MainLayout from './layouts/MainLayout';

import "./App.module.css";

function App() {
    const [authData, setAuthData] = useState(() => {
        localStorage.removeItem('accessToken');
        return {};
    });
    const navigate = useNavigate();

    const loginSubmitHandler = async (values) => {
        const result = await authService.login(values.email, values.password);
        setAuthData(result);
        localStorage.setItem('accessToken', result.accessToken);
        navigate(-1);
    };

    const registerSubmitHandler = async (values) => {
        const result = await authService.register(values.username, values.email, values.password);
        setAuthData(result);
        localStorage.setItem('accessToken', result.accessToken);
        navigate(-2);
    };

    const logoutHandler = () => {
        setAuthData({});
        localStorage.removeItem('accessToken');
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
            <Routes>
                <Route path={Paths.Home} element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path={Paths.Catalog} element={<BookCatalog />} />
                    <Route path={Paths.BooksByCategory} element={<BookCatalog />} />
                    <Route path={Paths.Bestsellers} element={<Bestsellers />} />
                    <Route path={Paths.BookDetails} element={<BookDetails />} />
                    <Route path={Paths.ShoppingBasket} element={<ShoppingBasket />} />
                </Route>

                <Route path={Paths.Login} element={<Login />} />
                <Route path={Paths.Register} element={<Register />} />
                <Route path={Paths.Logout} element={<Logout />} />
                <Route path={Paths.NotFound} element={<NotFound />} />
            </Routes>
        </AuthContext.Provider>


    )
}

export default App
