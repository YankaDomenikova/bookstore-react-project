import { request } from '../lib/request';

const baseUrl = "http://localhost:3030/data/books";

export const getAllBooks = async () => {
    const query = new URLSearchParams({
        select: "_id,title,author,price,imageUrl,_categoryId,format,quantity"
    });

    const result =  await request('GET', `${baseUrl}?${query}`);
    return result;
};


export const getBookById = async (bookId) => {
    const result =  await request('GET', `${baseUrl}/${bookId}`);
    return result;
}


export const getBestsellers = async () => {
    const query = new URLSearchParams({
        select: "_id,title,author,price,imageUrl,_categoryId,format,quantity",
        where: "isBestseller=true"
    });

    const result =  await request('GET', `${baseUrl}?${query}`);
    return result;
};


export const getLatest = async () => {
    const result = await request('GET', "http://localhost:3030/data/books?select=_id%2CimageUrl&sortBy=publishDate%20desc&offset=0&pageSize=5");
    return result;
}

export const getBookOfTheMonth = async () => {
    const query = new URLSearchParams({
        where:"isBookOfTheMonth=true",
    });

    const result = await request('GET', `${baseUrl}?${query}`);
    return result;
}