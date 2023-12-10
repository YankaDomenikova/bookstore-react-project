export const convert = (isoDateString) => {
    const dateObject = new Date(isoDateString);

    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const customDateFormat = dateObject.toLocaleString('en-gb', options);

    return customDateFormat;
}

