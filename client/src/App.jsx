import { Routes, Route, useLocation } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
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
    return (
        <AuthProvider>
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
        </AuthProvider>
    )
}

export default App
