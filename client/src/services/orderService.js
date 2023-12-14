import { request } from '../lib/request';

const baseUrl = "http://localhost:3030/data/orders";

export const getAll = async (userId) => {
    const query = new URLSearchParams({
        where: `_ownerId="${userId}"`,
    });

    const result =  await request('GET', `${baseUrl}?${query}`);
    return result;
};


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