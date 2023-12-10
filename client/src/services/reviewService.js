import { request } from '../lib/request';

const baseUrl = "http://localhost:3030/data/reviews";

export const getAllReviews = async (bookId) =>{
    const query = new URLSearchParams({
        where: `bookId="${bookId}"`
    });

    const result =  await request('GET', `${baseUrl}?${query}`);
    console.log(result);
    return result;
};

export const create = async (reviewText, bookId) => {
    const result =  await request('POST', baseUrl, {reviewText, bookId});
    return result;
}