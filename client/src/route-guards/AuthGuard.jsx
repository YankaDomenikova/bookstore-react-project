import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import AuthContext from "../contexts/AuthContext";
import { Paths } from "../paths/paths";

export default function AuthGuard({ children }) {
    const { isAuthenticated } = useContext(AuthContext);

    if (isAuthenticated) return <Navigate to={"/"} />;

    return <Outlet />;

}