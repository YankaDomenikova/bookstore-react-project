import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import AuthContext from "../contexts/AuthContext";
import { Paths } from "../paths/paths";

export default function GuestGuard({ children }) {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) return <Navigate to={Paths.Login} />;

    return <Outlet />;

}