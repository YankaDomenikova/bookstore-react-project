import { createContext, useState } from "react";
import { toast } from 'react-hot-toast';

const ShoppingContext = createContext();
ShoppingContext.displayName = "ShoppingContext";

export const ShoppingProvider = ({ children }) => {
    const [basketItems, setBasketItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [itemQuantity, setItemQuantity] = useState(1);

    // Add to basket
    const addToBasketHandler = (product) => {
        const isInBasket = basketItems.find((item) => item._id === product._id);
        setTotalPrice(price => price + product.price);
        setTotalQuantity(quantity => quantity + 1);

        if (isInBasket) {
            const updatedBasketItems = basketItems.map((item) => {
                if (item._id === product._id) {
                    return { ...item, basketQuantity: item.basketQuantity + 1 };
                }
            });
            setBasketItems(updatedBasketItems);
        }
        else {
            product.basketQuantity = 1;
            setBasketItems([...basketItems, product]);
        }
        toast.success("Book added to basket");
    };

    let targetItem;

    // Increment quantity
    const incrementItemQuantity = (id) => {
        targetItem = basketItems.find((item) => item._id === id);
        const newBasketItems = basketItems.filter((item) => item._id !== id);
        setBasketItems([
            ...newBasketItems,
            { ...targetItem, basketQuantity: targetItem.basketQuantity + 1 }
        ]);
        setTotalPrice(price => price + targetItem.price);
        setTotalQuantity(quantity => quantity + 1);
    };

    // Decrement quantity
    const decrementItemQuantity = (id) => {
        targetItem = basketItems.find((item) => item._id === id);
        const newBasketItems = basketItems.filter((item) => item._id !== id);
        if (targetItem.basketQuantity > 1) {
            setBasketItems([
                ...newBasketItems,
                { ...targetItem, basketQuantity: targetItem.basketQuantity - 1 }
            ]);
            setTotalPrice(price => price - targetItem.price);
            setTotalQuantity(quantity => quantity - 1);
        }
    };

    // Remove from basket

    const values = {
        basketItems,
        totalPrice,
        totalQuantity,
        itemQuantity,
        addToBasketHandler,
        incrementItemQuantity,
        decrementItemQuantity,
    }

    return (
        <ShoppingContext.Provider value={values}>
            {children}
        </ShoppingContext.Provider>
    );
}

export default ShoppingContext;