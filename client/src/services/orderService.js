import { request } from '../lib/request';

const baseUrl = "http://localhost:3030/data/orders";

export const create = async (email,
    fullname,
    phoneNumber,
    address,
    city,
    postalCode,
    orderNumber,
    basketItems,
    totalPrice,
    totalQuantity
    ) => {
    const result = await request('POST', baseUrl, {
        fullname,
        phoneNumber,
        address,
        city,
        postalCode, 
        orderNumber,
        items: basketItems, 
        totalPrice, 
        totalQuantity
    } );
}