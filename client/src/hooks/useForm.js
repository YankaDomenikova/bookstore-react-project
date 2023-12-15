import { useState } from "react";

import { validate } from "../utils/fromValidator";

export default function useForm(submitHandler,initialValues){
    const [values, setValues] = useState( initialValues);
    const [errors, setErrors] = useState({});

    const onChange = (e) => {
        setValues(state => ({
            ...state,
            [e.target.name] : e.target.value
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        submitHandler(values);
        setValues(initialValues);
    };

    const onBlur = (key) =>{
        const error  = validate(key, values[key]);
        setErrors(state => ({
            ...state,
            [key]: error
        }));
    }

    return {
        values,
        onChange,
        onSubmit,
        onBlur,
        errors
    }
}