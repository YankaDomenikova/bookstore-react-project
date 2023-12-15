const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordPattern = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
const usernamePattern = /^[a-zA-Z_.]{3,40}$/;
const postalcodePattern = /^\d{4}$/;

export const validate = (key, value) => {
    let error = null;

    switch (key) {
        case 'email':
            if(!emailPattern.test(value)) 
                error = "Invalid email"
            break;
    
        case 'password':
            if(!passwordPattern.test(value)) 
                error = "Passwords must be over 8 characters and contain at least one uppercase, lowercase letter, number and special character";
            break;
        case 'username':
            if(!usernamePattern.test(value)) 
                error = "Username must contain only uppercase, lowercase letters, . and _"
            break;
        case 'postalCode':
            if(!postalcodePattern.test(value)) 
                error = "Invalid postal code"
            break;
        default:
            break;
    }
    
    return error;
}

