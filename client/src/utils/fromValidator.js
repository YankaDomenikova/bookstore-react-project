const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordPattern = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
const usernamePattern = /^[a-zA-Z_.]{3,40}$/;
const postalcodePattern = /^\d{4}$/;
const fullnamePattern = /^[a-zA-Z\s]+$/;
const phonenumberPattern = /^(\+359( )?\d{9})$/;

export const validate = (key, value) => {
    let error = null;

    switch (key) {
        case 'email':
            if(!emailPattern.test(value)) 
                error = "Invalid email"
            break;
        case 'password':
            if(!passwordPattern.test(value)) 
                error = "Passwords must be over 8 characters, at least one uppercase and lowercase letter, number and special character";
            break;
        case 'username':
            if(!usernamePattern.test(value)) 
                error = "Username must contain only uppercase, lowercase letters, . and _"
            break;
        case 'postalCode':
            if(!postalcodePattern.test(value)) 
                error = "Invalid postal code"
            break;
        case 'fullName':
            if(!fullnamePattern.test(value))
                error = "Invalid name";
            break;
        case 'phoneNumber':
            if(!phonenumberPattern.test(value))
                error = "Invalid phone number";
            break;
        case 'rating':
            if (value === 0)
                error = "You must give your rating";
            break;
        case 'text':
            if (value.length === 0)
                error = "Review is required";
            break;
        case 'address':
            if (value.length === 0)
                error = "Invalid address";
            break;
        case 'city':
            if (value.length === 0)
                error = "Invalid city";
            break;
        default:
            break;
    }
    
    return error;
}

