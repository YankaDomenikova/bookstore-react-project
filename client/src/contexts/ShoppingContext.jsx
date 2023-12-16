import { createContext, useState } from "react";
import { toast } from 'react-hot-toast';

import usePersistedState from "../hooks/usePersistedState";
import { round } from '../utils/numberRounder';

const ShoppingContext = createContext();
ShoppingContext.displayName = "ShoppingContext";

export const ShoppingProvider = ({ children }) => {
    const [basketItems, setBasketItems] = usePersistedState("basketItems", []);
    const [totalPrice, setTotalPrice] = usePersistedState("totalPrice", 0);
    const [totalQuantity, setTotalQuantity] = usePersistedState("totalQuantity", 0);

    const addToBasketHandler = (product) => {
        const isInBasket = basketItems.find((item) => item._id === product._id);
        setTotalPrice(price => round(price + product.price));
        setTotalQuantity(quantity => quantity + 1);

        if (isInBasket) {
            const updatedBasketItems = basketItems.map((item) => {
                if (item._id === product._id) {
                    return { ...item, basketQuantity: item.basketQuantity + 1 };
                }
            });
            setBasketItems([...basketItems, updatedBasketItems]);
        }
        else {
            product.basketQuantity = 1;
            setBasketItems([...basketItems, product]);
        }
        toast.success("Book added to basket");
    };

    let targetItem;
    let itemIndex;

    const updateItemQuantity = (action, id) => {
        targetItem = basketItems.find((item) => item._id === id);
        itemIndex = basketItems.findIndex((item) => item._id === id);
        const newBasketItems = basketItems.filter((item) => item._id !== id);

        if (action === "increment") {
            setBasketItems([
                ...newBasketItems.slice(0, itemIndex),
                { ...targetItem, basketQuantity: targetItem.basketQuantity + 1 },
                ...newBasketItems.slice(itemIndex)
            ]);
            setTotalPrice(price => round(price + targetItem.price));
            setTotalQuantity(quantity => quantity + 1);
        }
        else if (action === "decrement") {
            if (targetItem.basketQuantity > 1) {
                setBasketItems([
                    ...newBasketItems.slice(0, itemIndex),
                    { ...targetItem, basketQuantity: targetItem.basketQuantity - 1 },
                    ...newBasketItems.slice(itemIndex)
                ]);
                setTotalPrice(price => round(price - targetItem.price));
                setTotalQuantity(quantity => quantity - 1);
            }
        }
    }


    const removeItem = (product) => {
        targetItem = basketItems.find((item) => item._id === product._id);
        const newBasketItems = basketItems.filter((item) => item._id !== product._id);
        setBasketItems(newBasketItems);
        setTotalPrice(price => round(price - targetItem.price * targetItem.basketQuantity))
        setTotalQuantity(quantity => quantity - targetItem.basketQuantity);
        toast.success("Book removed from basket");
    };

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
        updateItemQuantity,
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