
import React, { useEffect, useState } from "react";
import {
    UserRound,
    MapPin,
    Settings,
    ShieldCheck,
    Bell,
    CircleHelp,
    LogOut,
    ChevronRight,
    Save,
    LoaderCircle,
    CheckCircle,
    AlertCircle,
    X,
    CalendarDays,
    Mail,
    BriefcaseBusiness
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import ClientNavbar from "../components/ClientNavbar";

import {
    fetchMyProfile,
    updateMyProfile
} from "../services/api";

import { logout } from "../services/authSession";

import "../styles/FreelancerProfile.css";
import "../styles/ClientProfile.css";

const settingsNavigation = [
    {
        label: "Profile",
        icon: UserRound,
        to: "/client/profile"
    },
    {
        label: "Account Settings",
        icon: Settings,
        to: "/client/account-settings"
    },
    {
        label: "Security",
        icon: ShieldCheck,
        to: "/client/security"
    },
    {
        label: "Notifications",
        icon: Bell,
        to: "/client/notifications"
    },
    {
        label: "Help & Support",
        icon: CircleHelp,
        to: "/client/support"
    }
];

const ClientProfile = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [location, setLocation] = useState("");

    const [createdAt, setCreatedAt] = useState("");

    const applyProfile = (user) => {
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setEmail(user.email || "");
        setUsername(user.username || "");
        setLocation(user.location || "");
        setCreatedAt(user.createdAt || "");
    };

    // Load the client's saved profile.
    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetchMyProfile();

                if (!response?.user) {
                    throw new Error(
                        "Unable to retrieve your profile."
                    );
                }

                if (isMounted) {
                    applyProfile(response.user);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.message ||
                        "Unable to load your profile. Please try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    // Save the client's updated profile.
    const handleSaveProfile = async (event) => {
        event.preventDefault();

        setError("");
        setSuccessMessage("");

        if (!firstName.trim() || !lastName.trim()) {
            setError("Please enter your first and last name.");
            return;
        }

        try {
            setSaving(true);

            const profileData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                username: username.trim(),
                location: location.trim()
            };

            const response = await updateMyProfile(profileData);

            if (!response?.user) {
                throw new Error(
                    "The server did not return your updated profile."
                );
            }

            applyProfile(response.user);

            setSuccessMessage(
                response.message ||
                "Your profile has been updated successfully."
            );
        } catch (err) {
            setError(
                err.message ||
                "Unable to save your profile. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    // Reload saved profile information.
    const handleCancelChanges = async () => {
        try {
            setError("");
            setSuccessMessage("");
            setLoading(true);

            const response = await fetchMyProfile();

            if (!response?.user) {
                throw new Error(
                    "Unable to reload your saved profile."
                );
            }

            applyProfile(response.user);
        } catch (err) {
            setError(
                err.message ||
                "Unable to reload your saved profile."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const initials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`
            .toUpperCase() || "C";

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "long",
            year: "numeric"
        })
        : "Not available";

    return (
        <div className="fps-page client-profile-page">

            {/* Client navigation */}
            <ClientNavbar />

            <div className="freelancer-dashboard-content fps-content">

                {/* Page heading */}
                <header className="fps-heading">
                    <p className="fps-eyebrow">SETTINGS</p>

                    <h1>My Profile</h1>

                    <p>
                        Manage your personal information and
                        keep your HustleHub+ account up to date.
                    </p>
                </header>

                {/* Error message */}
                {error && (
                    <div
                        className="fps-notice fps-error-notice"
                        role="alert"
                    >
                        <AlertCircle size={17} />

                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Success message */}
                {successMessage && (
                    <div
                        className="fps-notice fps-success-notice"
                        role="status"
                    >
                        <CheckCircle size={17} />

                        <span>{successMessage}</span>

                        <button
                            type="button"
                            onClick={() => setSuccessMessage("")}
                            aria-label="Dismiss success message"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="fps-settings-layout">

                    {/* Settings sidebar */}
                    <aside className="fps-settings-sidebar">

                        <h2>Settings</h2>

                        <nav aria-label="Client settings navigation">

                            {settingsNavigation.map((item) => {
                                const Icon = item.icon;

                                const isActive =
                                    item.to === "/client/profile";

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={
                                            isActive
                                                ? "fps-settings-nav-item is-active"
                                                : "fps-settings-nav-item"
                                        }
                                        aria-current={
                                            isActive ? "page" : undefined
                                        }
                                    >
                                        <Icon
                                            size={16}
                                            aria-hidden="true"
                                        />

                                        <span>{item.label}</span>

                                        <ChevronRight
                                            size={15}
                                            className="fps-nav-chevron"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                );
                            })}

                            <button
                                type="button"
                                className="fps-settings-nav-item fps-logout-item"
                                onClick={handleLogout}
                            >
                                <LogOut size={16} />

                                <span>Logout</span>
                            </button>

                        </nav>
                    </aside>

                    {/* Main profile content */}
                    <main className="fps-settings-main">

                        {loading ? (
                            <div className="fps-loading">
                                <LoaderCircle
                                    size={24}
                                    className="fps-loading-icon"
                                />

                                <p>Loading your profile...</p>
                            </div>
                        ) : (
                            <form
                                className="fps-profile-form"
                                onSubmit={handleSaveProfile}
                            >

                                {/* Profile summary */}
                                <section className="fps-profile-summary">

                                    <div className="fps-avatar">
                                        {initials}
                                    </div>

                                    <div className="fps-profile-summary-info">

                                        <h2>
                                            {`${firstName} ${lastName}`.trim() ||
                                                "Your Name"}
                                        </h2>

                                        <p>
                                            HustleHub+ Client
                                        </p>

                                        {location && (
                                            <span className="fps-profile-location">
                                                <MapPin size={14} />

                                                {location}
                                            </span>
                                        )}

                                    </div>

                                    <button
                                        type="button"
                                        className="fps-secondary-button"
                                        onClick={() =>
                                            document
                                                .getElementById("client-firstName")
                                                ?.focus()
                                        }
                                    >
                                        <UserRound size={15} />

                                        Edit Details
                                    </button>

                                </section>

                                <p className="fps-photo-hint">
                                    Your profile initials are automatically
                                    generated from your first and last name.
                                </p>

                                {/* Personal information */}
                                <section className="fps-profile-section">

                                    <div className="fps-panel-heading">

                                        <div>
                                            <h2>Personal Information</h2>

                                            <p>
                                                Update the personal information
                                                associated with your account.
                                            </p>
                                        </div>

                                        <span className="fps-heading-icon">
                                            <UserRound size={20} />
                                        </span>

                                    </div>

                                    <div className="fps-section-body">

                                        <div className="fps-grid">

                                            <div className="fps-form-group">
                                                <label htmlFor="client-firstName">
                                                    First Name *
                                                </label>

                                                <input
                                                    id="client-firstName"
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(event) =>
                                                        setFirstName(
                                                            event.target.value
                                                        )
                                                    }
                                                    autoComplete="given-name"
                                                    required
                                                />
                                            </div>

                                            <div className="fps-form-group">
                                                <label htmlFor="client-lastName">
                                                    Last Name *
                                                </label>

                                                <input
                                                    id="client-lastName"
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(event) =>
                                                        setLastName(
                                                            event.target.value
                                                        )
                                                    }
                                                    autoComplete="family-name"
                                                    required
                                                />
                                            </div>

                                            <div className="fps-form-group">
                                                <label htmlFor="client-email">
                                                    Email Address
                                                </label>

                                                <input
                                                    id="client-email"
                                                    type="email"
                                                    value={email}
                                                    readOnly
                                                    autoComplete="email"
                                                />

                                                <small>
                                                    Your registered email address
                                                    cannot be changed here.
                                                </small>
                                            </div>

                                            <div className="fps-form-group">
                                                <label htmlFor="client-username">
                                                    Username
                                                </label>

                                                <input
                                                    id="client-username"
                                                    type="text"
                                                    value={username}
                                                    onChange={(event) =>
                                                        setUsername(
                                                            event.target.value
                                                        )
                                                    }
                                                    autoComplete="username"
                                                    placeholder="Enter a username"
                                                />
                                            </div>

                                            <div className="fps-form-group fps-full-width">
                                                <label htmlFor="client-location">
                                                    <MapPin
                                                        size={14}
                                                        aria-hidden="true"
                                                    />

                                                    Location
                                                </label>

                                                <input
                                                    id="client-location"
                                                    type="text"
                                                    value={location}
                                                    onChange={(event) =>
                                                        setLocation(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. Pretoria, South Africa"
                                                    autoComplete="address-level2"
                                                />
                                            </div>

                                        </div>
                                    </div>
                                </section>

                                {/* Account information */}
                                <section className="fps-profile-section">

                                    <div className="fps-panel-heading">

                                        <div>
                                            <h2>Account Information</h2>

                                            <p>
                                                View information about your
                                                HustleHub+ account.
                                            </p>
                                        </div>

                                        <span className="fps-heading-icon">
                                            <BriefcaseBusiness size={20} />
                                        </span>

                                    </div>

                                    <div className="fps-section-body">

                                        <div className="client-account-info-grid">

                                            <div className="client-account-info-card">
                                                <span className="client-info-icon">
                                                    <BriefcaseBusiness size={18} />
                                                </span>

                                                <div>
                                                    <small>Account Type</small>

                                                    <strong>Client</strong>
                                                </div>
                                            </div>

                                            <div className="client-account-info-card">
                                                <span className="client-info-icon">
                                                    <CalendarDays size={18} />
                                                </span>

                                                <div>
                                                    <small>Member Since</small>

                                                    <strong>
                                                        {formattedDate}
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="client-account-info-card client-account-email-card">
                                                <span className="client-info-icon">
                                                    <Mail size={18} />
                                                </span>

                                                <div>
                                                    <small>Registered Email</small>

                                                    <strong>
                                                        {email || "Not available"}
                                                    </strong>
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </section>

                                {/* Form actions */}
                                <div className="fps-form-actions">

                                    <button
                                        type="button"
                                        className="fps-secondary-button"
                                        onClick={handleCancelChanges}
                                        disabled={saving || loading}
                                    >
                                        Cancel Changes
                                    </button>

                                    <button
                                        type="submit"
                                        className="fps-primary-button"
                                        disabled={saving || loading}
                                    >
                                        {saving ? (
                                            <>
                                                <LoaderCircle
                                                    size={16}
                                                    className="fps-loading-icon"
                                                />

                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />

                                                Save Profile
                                            </>
                                        )}
                                    </button>

                                </div>

                            </form>
                        )}

                    </main>
                </div>
            </div>
        </div>
    );
};

export default ClientProfile;
