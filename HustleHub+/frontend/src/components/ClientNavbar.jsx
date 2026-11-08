import { getCurrentUser, logout } from "../services/authSession";
import { Link, NavLink, useNavigate } from "react-router-dom";

function ClientNavbar() {
    const navigate = useNavigate();

    const user = getCurrentUser();

    const isClient =
        String(user?.role || "").trim().toLowerCase() === "client";

    const firstName = String(
        user?.firstName ||
        user?.name ||
        user?.username ||
        ""
    ).trim(); // (IIE, 2026)

    const initial = firstName
        ? firstName.charAt(0).toUpperCase()
        : "?";

    const getNavClass = ({ isActive }) =>
        isActive ? "nav-link active" : "nav-link";

    const handleLogout = () => {
        // Clear the current user's login session
        logout();

        // Return to the public homepage
        navigate("/", { replace: true });
    };

    // (Mozilla, 2025)
    return (
        <header className="client-navbar">
            <div className="navbar-inner">

                <Link to="/" className="brand">
                    <span className="brand-main">
                        HustleHub
                    </span>

                    <span className="brand-plus">
                        +
                    </span>
                </Link>

                <nav className="nav-links">

                    <NavLink
                        to={isClient ? "/client/home" : "/"}
                        className={getNavClass}
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/gigs"
                        className={getNavClass}
                    >
                        Browse Gigs
                    </NavLink>

                    {isClient && (
                        <>
                            <NavLink
                                to="/client/orders"
                                className={getNavClass}
                            >
                                My Orders
                            </NavLink>

                            <NavLink
                                to="/client/messages"
                                className={getNavClass}
                            >
                                Messages
                            </NavLink>

                            <NavLink
                                to="/client/profile"
                                className={getNavClass}
                            >
                                Profile
                            </NavLink>
                        </>
                    )}

                </nav>

                <div className="nav-actions">

                    {isClient ? (
                        <>
                            <div className="nav-avatar">
                                {initial}
                            </div>

                            {/* (Mozilla, 2025) */}
                            <button
                                type="button"
                                className="client-logout-btn"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="secondary-button"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="primary-button"
                            >
                                Register
                            </Link>
                        </>
                    )}

                </div>
            </div>
        </header>
    );
}

export default ClientNavbar;

/*
Reference List

The Independent Institute of Education (IIE), 2026. Information Systems 3D [INSY7314 Module Manual]. The Independent Institute of Education: Unpublished.

Mozilla, 2025. JavaScript reference: Standard built-in objects. [online] Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference [Accessed: 7 October 2026].
*/
