import { request } from "../lib/request"

const baseUrl = 'http://localhost:3030/users';

export const login = async (email, password) => {
    const result = await request('POST', `${baseUrl}/login`, {email, password});
    return result;
}

export const register = async (username, email, password ) => request('POST', `${baseUrl}/register`, {
    username, 
    email, 
    password
});


export const logout = async () => request('GET', `${baseUrl}/logout`);