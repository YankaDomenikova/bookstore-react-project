import { Routes, Route } from 'react-router-dom';

import Home from "./components/home/Home";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import BookCatalogItem from "./components/book-catalog/book-catalog-item/BookCatalogItem";
import BookCatalog from "./components/book-catalog/BookCatalog";
import NotFound from "./components/not-found/NotFound";

import MainLayout from './layouts/MainLayout';

import { Paths } from './paths/paths';

import "./App.module.css";

function App() {
    return (
        <>
            <Routes>
                <Route path={Paths.Home} element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path={Paths.Catalog} element={<BookCatalog />} />
                </Route>

                <Route path={Paths.Login} element={<Login />} />
                <Route path={Paths.Register} element={<Register />} />
                <Route path={Paths.NotFound} element={<NotFound />} />
            </Routes>
        </>

    )
}

export default App
