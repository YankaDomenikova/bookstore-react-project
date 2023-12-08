const buildOptions = (data) => {
    const options = {};

    if(data){
        options.headers = {
            'content-type': 'application/json'
        },
        options.body = JSON.stringify(data);
    }

    return options;
};

export const request = async (method, url, data) => {
    const response = await fetch(url, {
        ...buildOptions(data),
        method,
    });

    const result = await response.json();
    return result;
};