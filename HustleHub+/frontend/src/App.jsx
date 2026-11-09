import {
    BrowserRouter,
    Navigate,
    Outlet,
    Route,
    Routes,
    useLocation
} from "react-router-dom";

import "./styles/clientMarketplace.css";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import AccountTypePage from "./pages/AccountTypePage";
import LoginPage from "./pages/LoginPage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import AboutPage from "./pages/AboutPage"; /* //(MDN Web Docs, 2026) */

import ClientHome from "./pages/ClientHome";
import BrowseGigs from "./pages/BrowseGigs";
import GigDetails from "./pages/GigDetails";
import CreateBooking from "./pages/CreateBooking";
import BookingConfirmation from "./pages/BookingConfirmation"; /* (MDN Web Docs, 2026) */
import MyOrders from "./pages/MyOrders";
import Messages from "./pages/Messages";
import ClientProfile from "./pages/ClientProfile";
import ClientAccountSettings from "./pages/ClientAccountSettings";

import ClientOrders from "./pages/ClientOrders";                   /* Page 11 */
import OrderDetails from "./pages/OrderDetails";           /* Page 12 */
import FreelancerDashboard from "./pages/FreelancerDashboard"; /* Page 13 */
import MyGigs from "./pages/MyGigs";                       /* Page 14 */
import FreelancerOrders from "./pages/FreelancerOrders"; /* Page 15 */

import FreelancerEarnings from "./pages/FreelancerEarnings"; /* Page 16 */
import FreelancerEstimatedTax from "./pages/FreelancerEstimatedTax"; /* Page 17 */
import FreelancerTransactions from "./pages/FreelancerTransactions"; /* Page 18 */
import FreelancerMessages from "./pages/FreelancerMessages"; /* Page 19 */

import FreelancerProfile from "./pages/FreelancerProfile"; /* Page 20 */
import FreelancerAccountSettings from "./pages/FreelancerAccountSettings"; /* Page 20 */
import FreelancerSecurity from "./pages/FreelancerSecurity"; /* Page 20 */
import FreelancerNotifications from "./pages/FreelancerNotifications"; /* Page 20 */
import FreelancerSupport from "./pages/FreelancerSuppport"; /* Page 20 */

import FreelancerGigs from "./pages/FreelancerGigs";
import FreelancerGigDetails from "./pages/FreelancerGigDetails";
import ClientGigs from "./pages/ClientGigs";
import ClientGigDetails from "./pages/ClientGigDetails";

import {
    getCurrentUser,
    isAuthenticated
} from "./services/authSession";

function MarketplaceLayout() {
    return (
        <div className="hh-marketplace">
            <Outlet />
        </div>
    );
}

function ClientRoute() {
    const location = useLocation();
    const user = getCurrentUser();

    if (!isAuthenticated() || !user) {
        return (
            <Navigate
                to="/login"
                state={{
                    from: location.pathname + location.search
                }}
                replace
            />
        );
    }

    const role = String(user.role || "")
        .trim()
        .toLowerCase();

    if (role !== "client") {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return <Outlet />;
}

function FreelancerRoute() {
    const location = useLocation();
    const user = getCurrentUser();

    if (!isAuthenticated() || !user) {
        return (
            <Navigate
                to="/login"
                state={{
                    from: location.pathname + location.search
                }}
                replace
            />
        );
    }

    const role = String(user.role || "")
        .trim()
        .toLowerCase();
    if (role !== "freelancer") {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return <Outlet />;
}

// Allow visitors to browse services without logging in
function BrowseServicesRedirect() {
    return <Navigate to="/client/home" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public website pages */}
                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="/account-type"
                    element={<AccountTypePage />} /* //(MDN Web Docs, 2026) */
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/verify-otp"
                    element={<VerifyOTPPage />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                />

                <Route
                    path="/how-it-works"
                    element={<HowItWorksPage />}
                />

                <Route
                    path="/about"
                    element={<AboutPage />}
                />

                <Route
                    path="/browse-services"
                    element={<BrowseServicesRedirect />}
                />

                <Route element={<MarketplaceLayout />}>

                    <Route
                        path="/client/home"
                        element={<ClientHome />}
                    />

                    <Route
                        path="/gigs"
                        element={<BrowseGigs />}
                    />

                    <Route
                        path="/gigs/:id"
                        element={<GigDetails />}
                    />

                    <Route element={<ClientRoute />}>

                        <Route
                            path="/booking/:gigId"
                            element={<CreateBooking />} /* (MDN Web Docs, 2026) */
                        />

                        <Route
                            path="/booking/confirmation/:bookingId"
                            element={<BookingConfirmation />}
                        />

                        <Route
                            path="/client/orders"
                            element={<MyOrders />}
                        />

                        <Route
                            path="/client/orders/:orderId"
                            element={<OrderDetails />}
                        />

                        <Route
                            path="/client/messages"
                            element={<Messages />}
                        />
                        
                        <Route
                            path="/gigs"
                            element={<ClientGigs />}
                        />

                        <Route
                            path="/gigs/:id"
                            element={<ClientGigDetails />}
                        />

                        <Route
                            path="/client/profile"
                            element={<ClientProfile />}
                        />

                        <Route
                            path="/client/account-settings"
                            element={<ClientAccountSettings />}
                        />

                    </Route>

                    {/* Freelancer Protected Routes */}
                    <Route element={<FreelancerRoute />}>

                        {/* Page 13: Freelancer Dashboard */}
                        <Route
                            path="/freelancer/dashboard"
                            element={<FreelancerDashboard />}
                        />

                        {/* Page 14: My Gigs (Freelancer) */}
                        <Route
                            path="/freelancer/gigs"
                            element={<FreelancerGigs />}
                        />

                        <Route
                            path="/freelancer/gigs/:id"
                            element={<FreelancerGigDetails />}
                        />

                        {/* Page 15: Orders (Freelancer) */}
                        <Route
                            path="/freelancer/orders"
                            element={<FreelancerOrders />}
                        />

                        <Route
                            path="/freelancer/messages"
                            element={<FreelancerMessages />}
                        />

                        <Route
                            path="/freelancer/earnings"
                            element={<FreelancerEarnings />}
                        />

                        <Route
                            path="/freelancer/estimated-tax"
                            element={<FreelancerEstimatedTax />}
                        />

                        <Route
                            path="/freelancer/transactions"
                            element={<FreelancerTransactions />}
                        />

                        <Route
                            path="/freelancer/profile"
                            element={<FreelancerProfile />}
                        />

                        <Route
                            path="/freelancer/account-settings"
                            element={<FreelancerAccountSettings />}
                        />

                        <Route
                            path="/freelancer/security"
                            element={<FreelancerSecurity />}
                        />

                        <Route
                            path="/freelancer/notifications"
                            element={<FreelancerNotifications />}
                        />

                        <Route
                            path="/freelancer/support"
                            element={<FreelancerSupport />}
                        />
                    </Route>
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App; /* //(MDN Web Docs, 2026) */

/* Reference List:
    1. MDN Web Docs, 2026. Resources for Developers, by Developers.[online] Available at: <https://developer.mozilla.org/en-US/> [Accessed 8 October 2026].
*/
