import { request } from '../lib/request';

const baseUrl = "http://localhost:3030/data/books";

export const getAllBooks = async () => {
    const query = new URLSearchParams({
        select: "_id,title,author,price,imageUrl,_categoryId"
    });

    const result =  await request('GET', `${baseUrl}?${query}`);
    return result;
};


export const getBookById = async (bookId) => {
    const result =  await request('GET', `${baseUrl}/${bookId}`);
    return result;
}
