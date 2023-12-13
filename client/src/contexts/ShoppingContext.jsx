import { createContext, useState } from "react";
import { toast } from 'react-hot-toast';
import usePersistedState from "../hooks/usePersistedState";

const ShoppingContext = createContext();
ShoppingContext.displayName = "ShoppingContext";

export const ShoppingProvider = ({ children }) => {
    const [basketItems, setBasketItems] = usePersistedState("basketItems", []);
    const [totalPrice, setTotalPrice] = usePersistedState("totalPrice", 0);
    const [totalQuantity, setTotalQuantity] = usePersistedState("totalQuantity", 0);

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
    let itemIndex;

    // Increment quantity
    const incrementItemQuantity = (id) => {
        targetItem = basketItems.find((item) => item._id === id);
        itemIndex = basketItems.findIndex((item) => item._id === id);
        const newBasketItems = basketItems.filter((item) => item._id !== id);
        setBasketItems([
            ...newBasketItems.slice(0, itemIndex),
            { ...targetItem, basketQuantity: targetItem.basketQuantity + 1 },
            ...newBasketItems.slice(itemIndex)
        ]);
        setTotalPrice(price => price + targetItem.price);
        setTotalQuantity(quantity => quantity + 1);
    };

    // Decrement quantity
    const decrementItemQuantity = (id) => {
        targetItem = basketItems.find((item) => item._id === id);
        itemIndex = basketItems.findIndex((item) => item._id === id);
        const newBasketItems = basketItems.filter((item) => item._id !== id);
        if (targetItem.basketQuantity > 1) {
            setBasketItems([
                ...newBasketItems.slice(0, itemIndex),
                { ...targetItem, basketQuantity: targetItem.basketQuantity - 1 },
                ...newBasketItems.slice(itemIndex)
            ]);
            setTotalPrice(price => price - targetItem.price);
            setTotalQuantity(quantity => quantity - 1);
        }
    };

    // Remove from basket
    const removeItem = (product) => {
        targetItem = basketItems.find((item) => item._id === product._id);
        const newBasketItems = basketItems.filter((item) => item._id !== product._id);
        setBasketItems(newBasketItems);
        setTotalPrice(price => price - targetItem.price * targetItem.basketQuantity)
        setItemQuantity(quantity => quantity - targetItem.quantity);
    };

    // Reset basket
    const resetBasket = () => {
        setBasketItems([]);
        setTotalPrice(0)
        setTotalQuantity(0);
    }

    const values = {
        basketItems,
        totalPrice,
        totalQuantity,
        addToBasketHandler,
        incrementItemQuantity,
        decrementItemQuantity,
        removeItem,
        resetBasket
    }

    return (
        <ShoppingContext.Provider value={values}>
            {children}
        </ShoppingContext.Provider>
    );
}

export default ShoppingContext;