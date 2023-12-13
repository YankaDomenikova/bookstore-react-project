import { createContext, useState } from "react";


const ShoppingContext = createContext();
ShoppingContext.displayName = "ShoppingContext";

export const ShoppingProvider = ({ children }) => {
    const [basketItems, setBasketItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [itemQuantity, setItemQuantity] = useState(1);

    const values = {
        basketItems,
        totalPrice,
        totalQuantity,
        itemQuantity
    }

    return (
        <ShoppingContext.Provider value={values}>
            {children}
        </ShoppingContext.Provider>
    );
}

export default ShoppingContext;