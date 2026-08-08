import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
    const accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");
    const location = useLocation();

    if (!accessToken || !refreshToken) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;