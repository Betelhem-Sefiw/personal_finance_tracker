import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./Layout.css";

function Layout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login", { replace: true });
    };

    return (
        <div className="layout">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        💰
                    </div>

                    <h2>Personal Finance</h2>
                </div>

                <nav className="sidebar-nav">

                    <NavLink to="/dashboard">
                        📊 Dashboard
                    </NavLink>

                    <NavLink to="/transactions">
                        💳 Transactions
                    </NavLink>

                    <NavLink to="/budgets">
                        🎯 Budgets
                    </NavLink>

                    <NavLink to="/categories">
                        📁 Categories
                    </NavLink>

                    <NavLink to="/notifications">
                        🔔 Notifications
                    </NavLink>

                </nav>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* MAIN CONTENT */}

            <main className="main-content">
                <Outlet />
            </main>

        </div>
    );
}

export default Layout;