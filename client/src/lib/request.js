const buildOptions = (data) => {
    const options = {};

    if(data){
        options.headers = {
            'content-type': 'application/json'
        },
        options.body = JSON.stringify(data);
    }

    const authentication = JSON.parse(localStorage.getItem('authentication'));
    const accessToken = authentication.accessToken;

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

    if (!response.ok) {
        throw result;
    } 

    return result;
};