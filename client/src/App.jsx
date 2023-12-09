import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from "./components/home/Home";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import BookCatalog from "./components/book-catalog/BookCatalog";
import BookDetails from './components/book-details/BookDetails';
import Bestsellers from './components/book-catalog/bestsellers/Bestsellers';
import ShoppingBasket from './components/shopping-basket/ShoppingBasket';
import NotFound from "./components/not-found/NotFound";

import MainLayout from './layouts/MainLayout';
import AuthContext from './contexts/AuthContext';
import { Paths } from './paths/paths';

import "./App.module.css";

function App() {
    const [authData, setAuthData] = useState({});

    const loginSubmitHandler = (values) => {
        console.log(values);
    };


    return (

        <AuthContext.Provider value={loginSubmitHandler}>
            <Routes>
                <Route path={Paths.Home} element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path={Paths.Catalog} element={<BookCatalog />} />
                    <Route path={Paths.BooksByCategory} element={<BookCatalog />} />
                    <Route path={Paths.Bestsellers} element={<Bestsellers />} />
                    <Route path={Paths.BookDetails} element={<BookDetails />} />
                    <Route path={Paths.ShoppingBasket} element={<ShoppingBasket />} />
                </Route>

                <Route path={Paths.Login} element={<Login loginSubmitHandler={loginSubmitHandler} />} />
                <Route path={Paths.Register} element={<Register />} />
                <Route path={Paths.NotFound} element={<NotFound />} />
            </Routes>
        </AuthContext.Provider>


    )
}

export default App
