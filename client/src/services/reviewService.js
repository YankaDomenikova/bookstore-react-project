import { request } from '../lib/request';

const baseUrl = "http://localhost:3030/data/reviews";

export const getAllReviews = async (bookId) =>{
    const query = new URLSearchParams({
        where: `bookId="${bookId}"`,
        load: 'author=_ownerId:users'
    });

    const result =  await request('GET', `${baseUrl}?${query}`);
    return result;
};

export const create = async (text, rating, bookId) => {
    const result =  await request('POST', baseUrl, {text, rating, bookId});
    return result;
}