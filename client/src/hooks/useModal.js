import { useState } from "react";


export default function useModal(){
    const [show, setShow] = useState(false);

    const toggleShow = () => {
        setShow(!show);
        console.log("close")
    }

    return {
        show,
        toggleShow
    }
}