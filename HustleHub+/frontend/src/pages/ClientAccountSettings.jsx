
import React, { useState } from "react";
import {
    UserRound,
    Settings,
    ShieldCheck,
    Bell,
    CircleHelp,
    LogOut,
    ChevronRight,
    LockKeyhole,
    Eye,
    EyeOff,
    Save,
    LoaderCircle,
    CheckCircle,
    AlertCircle,
    X,
    KeyRound
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import ClientNavbar from "../components/ClientNavbar";

import { changeMyPassword } from "../services/api";
import { logout } from "../services/authSession";

import "../styles/FreelancerProfile.css";
import "../styles/ClientAccountSettings.css";

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

const ClientAccountSettings = () => {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const clearFeedback = () => {
        setError("");
        setSuccessMessage("");
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();
        clearFeedback();

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please complete all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Your new password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Your new passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            setError("Your new password must be different from your current password.");
            return;
        }

        try {
            setSaving(true);

            const response = await changeMyPassword({
                currentPassword,
                newPassword,
                confirmNewPassword: confirmPassword
            });

            setSuccessMessage(
                response.message ||
                "Your password has been changed successfully."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            /*
             * The backend should increment tokenVersion after a password
             * change, invalidating existing JWT sessions.
             * The user must then log in again.
             */
            setTimeout(() => {
                logout();
                navigate("/login", {
                    replace: true,
                    state: {
                        message: "Your password was changed. Please log in again."
                    }
                });
            }, 1800);

        } catch (err) {
            setError(
                err.message ||
                "Unable to change your password. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    return (
        <div className="fps-page client-account-settings-page">

            <ClientNavbar />

            <div className="freelancer-dashboard-content fps-content">

                <header className="fps-heading">
                    <p className="fps-eyebrow">SETTINGS</p>

                    <h1>Account Settings</h1>

                    <p>
                        Manage your account preferences and update
                        your password to keep your account secure.
                    </p>
                </header>

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
                                    item.to === "/client/account-settings";

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
                                        <Icon size={16} />

                                        <span>{item.label}</span>

                                        <ChevronRight
                                            size={15}
                                            className="fps-nav-chevron"
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

                    {/* Main account settings */}
                    <main className="fps-settings-main">

                        {/* Account overview */}
                        <section className="fps-profile-section">

                            <div className="fps-panel-heading">

                                <div>
                                    <h2>Account Preferences</h2>

                                    <p>
                                        Manage the security of your
                                        HustleHub+ account.
                                    </p>
                                </div>

                                <span className="fps-heading-icon">
                                    <Settings size={20} />
                                </span>

                            </div>

                            <div className="fps-section-body">

                                <div className="cas-account-overview">

                                    <div className="cas-overview-icon">
                                        <LockKeyhole size={22} />
                                    </div>

                                    <div>
                                        <h3>Password & Security</h3>

                                        <p>
                                            Keep your password private and
                                            update it regularly. Never share
                                            your login details with anyone.
                                        </p>
                                    </div>

                                </div>

                            </div>
                        </section>

                        {/* Change password */}
                        <section className="fps-profile-section">

                            <div className="fps-panel-heading">

                                <div>
                                    <h2>Change Password</h2>

                                    <p>
                                        Enter your current password and
                                        choose a new password.
                                    </p>
                                </div>

                                <span className="fps-heading-icon">
                                    <KeyRound size={20} />
                                </span>

                            </div>

                            <div className="fps-section-body">

                                <form
                                    className="cas-password-form"
                                    onSubmit={handlePasswordChange}
                                >

                                    {/* Current password */}
                                    <div className="fps-form-group">
                                        <label htmlFor="cas-current-password">
                                            Current Password *
                                        </label>

                                        <div className="cas-password-field">
                                            <input
                                                id="cas-current-password"
                                                type={
                                                    showCurrentPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={currentPassword}
                                                onChange={(event) => {
                                                    setCurrentPassword(event.target.value);
                                                    clearFeedback();
                                                }}
                                                placeholder="Enter your current password"
                                                autoComplete="current-password"
                                                disabled={saving}
                                                required
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCurrentPassword(
                                                        !showCurrentPassword
                                                    )
                                                }
                                                aria-label={
                                                    showCurrentPassword
                                                        ? "Hide current password"
                                                        : "Show current password"
                                                }
                                            >
                                                {showCurrentPassword
                                                    ? <EyeOff size={18} />
                                                    : <Eye size={18} />
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    {/* New password */}
                                    <div className="fps-form-group">
                                        <label htmlFor="cas-new-password">
                                            New Password *
                                        </label>

                                        <div className="cas-password-field">
                                            <input
                                                id="cas-new-password"
                                                type={
                                                    showNewPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={newPassword}
                                                onChange={(event) => {
                                                    setNewPassword(event.target.value);
                                                    clearFeedback();
                                                }}
                                                placeholder="Enter your new password"
                                                autoComplete="new-password"
                                                disabled={saving}
                                                required
                                                minLength={8}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        !showNewPassword
                                                    )
                                                }
                                                aria-label={
                                                    showNewPassword
                                                        ? "Hide new password"
                                                        : "Show new password"
                                                }
                                            >
                                                {showNewPassword
                                                    ? <EyeOff size={18} />
                                                    : <Eye size={18} />
                                                }
                                            </button>
                                        </div>

                                        <small>
                                            Use at least 8 characters.
                                        </small>
                                    </div>

                                    {/* Confirm password */}
                                    <div className="fps-form-group">
                                        <label htmlFor="cas-confirm-password">
                                            Confirm New Password *
                                        </label>

                                        <div className="cas-password-field">
                                            <input
                                                id="cas-confirm-password"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={confirmPassword}
                                                onChange={(event) => {
                                                    setConfirmPassword(event.target.value);
                                                    clearFeedback();
                                                }}
                                                placeholder="Confirm your new password"
                                                autoComplete="new-password"
                                                disabled={saving}
                                                required
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide confirmation password"
                                                        : "Show confirmation password"
                                                }
                                            >
                                                {showConfirmPassword
                                                    ? <EyeOff size={18} />
                                                    : <Eye size={18} />
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password guidance */}
                                    <div className="cas-password-guidance">
                                        <LockKeyhole size={17} />

                                        <p>
                                            For your protection, you will be
                                            asked to log in again after
                                            changing your password.
                                        </p>
                                    </div>

                                    {/* Submit */}
                                    <div className="fps-form-actions">

                                        <button
                                            type="button"
                                            className="fps-secondary-button"
                                            disabled={saving}
                                            onClick={() => {
                                                setCurrentPassword("");
                                                setNewPassword("");
                                                setConfirmPassword("");
                                                clearFeedback();
                                            }}
                                        >
                                            Clear Fields
                                        </button>

                                        <button
                                            type="submit"
                                            className="fps-primary-button"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <LoaderCircle
                                                        size={16}
                                                        className="fps-loading-icon"
                                                    />

                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />

                                                    Update Password
                                                </>
                                            )}
                                        </button>

                                    </div>

                                </form>

                            </div>
                        </section>

                    </main>
                </div>
            </div>
        </div>
    );
};

export default ClientAccountSettings;
