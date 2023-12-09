import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import * as authService from './services/authService';
import AuthContext from './contexts/AuthContext';
import { Paths } from './paths/paths';

import Home from "./components/home/Home";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import BookCatalog from "./components/book-catalog/BookCatalog";
import BookDetails from './components/book-details/BookDetails';
import Bestsellers from './components/book-catalog/bestsellers/Bestsellers';
import ShoppingBasket from './components/shopping-basket/ShoppingBasket';
import NotFound from "./components/not-found/NotFound";
import MainLayout from './layouts/MainLayout';

import "./App.module.css";

function App() {
    const [authData, setAuthData] = useState({});
    const navigate = useNavigate();

    const loginSubmitHandler = async (values) => {
        const result = await authService.login(values.email, values.password);
        setAuthData(result);
        navigate(-1);
    };

    const registerSubmitHandler = async (values) => {
        console.log(values);
    };

    const values = {
        loginSubmitHandler,
        username: authData.username,
        email: authData.email,
        isAuthenticated: !!authData.accessToken,
        registerSubmitHandler,
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
                <Route path={Paths.NotFound} element={<NotFound />} />
            </Routes>
        </AuthContext.Provider>


    )
}

export default App
