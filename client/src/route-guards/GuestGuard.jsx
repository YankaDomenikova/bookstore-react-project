import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import AuthContext from "../contexts/AuthContext";
import { Paths } from "../paths/paths";

export default function GuestGuard() {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) return <Navigate to={Paths.Login} replace={true} />;

    return <Outlet />;

}