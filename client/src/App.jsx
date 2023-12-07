import { Routes, Route } from 'react-router-dom';

import Home from "./components/home/Home";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import BookCatalog from "./components/book-catalog/BookCatalog";
import BookDetails from './components/book-details/BookDetails';
import Bestsellers from './components/book-catalog/bestsellers/Bestsellers';
import NotFound from "./components/not-found/NotFound";

import MainLayout from './layouts/MainLayout';

import { Paths } from './paths/paths';

import "./App.module.css";
import ShoppingBasket from './components/shopping-basket/ShoppingBasket';

function App() {
    return (
        <>
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
        </>

    )
}

export default App
