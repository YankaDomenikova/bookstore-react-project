import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { ShoppingProvider } from './contexts/ShoppingContext';
import { Paths } from './paths/paths';

import Home from "./components/home/Home";
import BookCatalog from "./components/book-catalog/BookCatalog";
import BookDetails from './components/book-details/BookDetails';
import Bestsellers from './components/book-catalog/bestsellers/Bestsellers';
import ShoppingBasket from './components/shopping-basket/ShoppingBasket';
import Checkout from './components/checkout/Checkout';
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import Logout from './components/authentication/logout/Logout';
import NotFound from "./components/not-found/NotFound";
import MainLayout from './layouts/MainLayout';

import "./App.module.css";

function App() {
    return (
        <ShoppingProvider>
            <AuthProvider>
                <Routes>
                    <Route path={Paths.Home} element={<MainLayout />}>
                        <Route index element={<Home />} />
                        <Route path={Paths.Catalog} element={<BookCatalog />} />
                        <Route path={Paths.BooksByCategory} element={<BookCatalog />} />
                        <Route path={Paths.Bestsellers} element={<Bestsellers />} />
                        <Route path={Paths.BookDetails} element={<BookDetails />} />
                        <Route path={Paths.ShoppingBasket} element={<ShoppingBasket />} />
                        <Route path={Paths.Checkout} element={<Checkout />} />
                    </Route>

                    <Route path={Paths.Login} element={<Login />} />
                    <Route path={Paths.Register} element={<Register />} />
                    <Route path={Paths.Logout} element={<Logout />} />
                    <Route path={Paths.NotFound} element={<NotFound />} />
                </Routes>
                <Toaster
                    toastOptions={{
                        success: {
                            iconTheme: {
                                primary: '#C80D44',
                            }
                        },
                    }} />
            </AuthProvider>
        </ShoppingProvider>
    )
}

export default App
