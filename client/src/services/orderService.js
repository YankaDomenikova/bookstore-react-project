import { request } from '../lib/request';

const baseUrl = "http://localhost:3030/data/orders";

export const getAll = async (userId) => {
    const query = new URLSearchParams({
        where: `_ownerId="${userId}"`,
    });

    const result =  await request('GET', `${baseUrl}?${query}&sortBy=_createdOn%20desc`);
    return result;
};

export const getOrderById = (orderId) => {
    const result = request('GET', `${baseUrl}/${orderId}`);
    return result;
}


export const create = async (
    email,
    fullName,
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
        email,
        fullName,
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


export const remove = async (orderId) => {
    const result = await request('DELETE', `${baseUrl}/${orderId}`);
    return result;
}