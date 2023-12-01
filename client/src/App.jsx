import Header from "./components/header/Header";
import NotFound from "./components/not-found/NotFound";
import Footer from "./components/footer/Footer";

import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";

import "./App.module.css";
import BookCatalogItem from "./components/book-catalog/book-catalog-item/BookCatalogItem";
import BookCatalog from "./components/book-catalog/BookCatalog";

function App() {
  return (
    <>
      <Header />
      <BookCatalog />
    </>
  )
}

export default App
