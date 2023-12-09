const buildOptions = (data) => {
    const options = {};

    if(data){
        options.headers = {
            'content-type': 'application/json'
        },
        options.body = JSON.stringify(data);
    }

    const accessToken = localStorage.getItem('accessToken');

    if(accessToken){
        options.headers = {
            ...options.headers,
            'X-Authorization': accessToken
        };
    }

    return options;
};

export const request = async (method, url, data) => {
    const response = await fetch(url, {
        ...buildOptions(data),
        method,
    });

    if(response.status === 204){
        return {};
    }

    const result = await response.json();
    return result;
};