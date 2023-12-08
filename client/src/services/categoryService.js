import { request } from '../lib/request';

const baseUrl = "http://localhost:3030/data/categories";

export const getAllCategories = async () => {
    const result = request('GET', baseUrl);
    return result;
}