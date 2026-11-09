import React, { useEffect, useState } from "react";
import {
    Settings,
    UserRound,
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
    Globe,
    Clock,
    Coins,
    Mail,
    CalendarDays,
    Monitor,
    RotateCcw,
    Info,
    Trash2,
    LockKeyhole,
    Eye,
    EyeOff,
    KeyRound
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import FreelancerHeader from "../components/FreelancerHeader";
import TwoFactorSettings from "../components/TwoFactorSettings";

import { fetchMyProfile, changeMyPassword } from "../services/api";
import { logout } from "../services/authSession";

import "../styles/FreelancerAccountSettings.css";

const settingsNavigation = [
    {
        label: "Profile",
        icon: UserRound,
        to: "/freelancer/profile"
    },
    {
        label: "Account Settings",
        icon: Settings,
        to: "/freelancer/account-settings"
    },
    {
        label: "Security",
        icon: ShieldCheck,
        to: "/freelancer/security"
    },
    {
        label: "Notifications",
        icon: Bell,
        to: "/freelancer/notifications"
    },
    {
        label: "Help & Support",
        icon: CircleHelp,
        to: "/freelancer/support"
    }
];

const DEFAULT_PREFERENCES = {
    language: "en-ZA",
    timezone: "Africa/Johannesburg",
    currency: "ZAR",
    dateFormat: "DD/MM/YYYY",
    theme: "system",
    emailUpdates: true,
    productUpdates: false
};

const STORAGE_KEY = "hustlehub_freelancer_account_preferences";

const FreelancerAccountSettings = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [account, setAccount] = useState({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        createdAt: ""
    });

    const [preferences, setPreferences] = useState(
        DEFAULT_PREFERENCES
    );

    // Password states - same as Client Account Settings
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadSettings = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetchMyProfile();

                if (!response?.user) {
                    throw new Error(
                        "Unable to retrieve your account information."
                    );
                }

                if (!isMounted) return;

                const user = response.user;

                setAccount({
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    email: user.email || "",
                    username: user.username || "",
                    createdAt: user.createdAt || user.created_at || ""
                });

                try {
                    const savedPreferences = localStorage.getItem(
                        STORAGE_KEY
                    );

                    if (savedPreferences) {
                        const parsed = JSON.parse(savedPreferences);

                        setPreferences({
                            ...DEFAULT_PREFERENCES,
                            ...parsed
                        });
                    }
                } catch {
                    setPreferences(DEFAULT_PREFERENCES);
                }

            } catch (err) {
                if (isMounted) {
                    setError(
                        err.message ||
                        "Unable to load account settings. Please try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadSettings();

        return () => {
            isMounted = false;
        };
    }, []);

    const clearFeedback = () => {
        setError("");
        setSuccessMessage("");
    };

    const updatePreference = (key, value) => {
        setPreferences((current) => ({
            ...current,
            [key]: value
        }));

        clearFeedback();
    };

    // Save regional, display and email preferences.
    const handleSaveSettings = (event) => {
        event.preventDefault();

        clearFeedback();

        try {
            setSaving(true);

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(preferences)
            );

            setSuccessMessage(
                "Your preferences have been saved on this browser."
            );

        } catch {
            setError(
                "Unable to save your preferences. Your browser may have local storage disabled."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleResetSettings = () => {
        setPreferences({ ...DEFAULT_PREFERENCES });
        clearFeedback();
    };

    // Handle password input changes.
    const handlePasswordInput = (setter, value) => {
        setter(value);
        clearFeedback();
    };

    // Same password-changing functionality as Client.
    const handlePasswordChange = async (event) => {
        event.preventDefault();
        clearFeedback();

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please complete all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            setError(
                "Your new password must contain at least 8 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Your new passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            setError(
                "Your new password must be different from your current password."
            );
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
             * The freelancer must then log in again.
             */
            window.setTimeout(() => {
                logout();

                navigate("/login", {
                    replace: true,
                    state: {
                        message:
                            "Your password was changed. Please log in again."
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

    const initials =
        `${account.firstName.charAt(0)}${account.lastName.charAt(0)}`
            .toUpperCase() || "F";

    const memberSince = account.createdAt
        ? new Date(account.createdAt).toLocaleDateString("en-ZA", {
              month: "long",
              year: "numeric"
          })
        : "";

    return (
        <div className="fas-page">

            <FreelancerHeader />

            <div className="freelancer-dashboard-content fas-content">

                <header className="fas-heading">
                    <p className="fas-eyebrow">SETTINGS</p>

                    <h1>Account Settings</h1>

                    <p>
                        Manage your account information, regional
                        preferences and experience on HustleHub+.
                    </p>
                </header>

                {/* Feedback messages */}
                {error && (
                    <div
                        className="fas-notice fas-error-notice"
                        role="alert"
                    >
                        <AlertCircle size={17} aria-hidden="true" />

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
                        className="fas-notice fas-success-notice"
                        role="status"
                    >
                        <CheckCircle size={17} aria-hidden="true" />

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

                <div className="fas-settings-layout">

                    {/* Settings navigation */}
                    <aside className="fas-settings-sidebar">

                        <h2>Settings</h2>

                        <nav aria-label="Freelancer settings navigation">

                            {settingsNavigation.map((item) => {
                                const Icon = item.icon;

                                const isActive =
                                    item.to ===
                                    "/freelancer/account-settings";

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={
                                            isActive
                                                ? "fas-settings-nav-item is-active"
                                                : "fas-settings-nav-item"
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
                                            className="fas-nav-chevron"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                );
                            })}

                            <button
                                type="button"
                                className="fas-settings-nav-item fas-logout-item"
                                onClick={handleLogout}
                            >
                                <LogOut size={16} aria-hidden="true" />
                                <span>Logout</span>
                            </button>

                        </nav>
                    </aside>

                    {/* Main settings */}
                    <main className="fas-settings-main">

                        {loading ? (
                            <div className="fas-loading">

                                <LoaderCircle
                                    size={24}
                                    className="fas-loading-icon"
                                    aria-hidden="true"
                                />

                                <p>Loading your account settings...</p>

                            </div>
                        ) : (
                            <>
                                {/* Account summary */}
                                <section className="fas-account-summary">

                                    <div className="fas-avatar">
                                        {initials}
                                    </div>

                                    <div className="fas-summary-info">

                                        <h2>
                                            {`${account.firstName} ${account.lastName}`
                                                .trim() || "Your Account"}
                                        </h2>

                                        <p>
                                            {account.username
                                                ? `@${account.username}`
                                                : "Freelancer account"}
                                        </p>

                                        {account.email && (
                                            <span className="fas-summary-email">
                                                <Mail
                                                    size={14}
                                                    aria-hidden="true"
                                                />
                                                {account.email}
                                            </span>
                                        )}

                                    </div>

                                    <Link
                                        to="/freelancer/profile"
                                        className="fas-secondary-button"
                                    >
                                        <UserRound size={15} />
                                        Edit Profile
                                    </Link>

                                </section>

                                <div className="fas-info-banner">
                                    <Info size={17} aria-hidden="true" />

                                    <p>
                                        Your personal and professional
                                        information is managed through your
                                        Profile page. These settings control
                                        your local preferences.
                                    </p>
                                </div>

                                {/* Account information */}
                                <section className="fas-section">

                                    <div className="fas-panel-heading">

                                        <div>
                                            <h2>Account Information</h2>

                                            <p>
                                                Review the details associated
                                                with your account.
                                            </p>
                                        </div>

                                        <span className="fas-heading-icon">
                                            <UserRound size={20} />
                                        </span>

                                    </div>

                                    <div className="fas-section-body">

                                        <div className="fas-account-detail">

                                            <div className="fas-detail-icon">
                                                <Mail size={17} />
                                            </div>

                                            <div className="fas-detail-content">
                                                <span>Email address</span>

                                                <strong>
                                                    {account.email ||
                                                        "No email available"}
                                                </strong>

                                                <small>
                                                    Email changes are not
                                                    available on this page.
                                                </small>
                                            </div>

                                            <span className="fas-status-pill">
                                                <CheckCircle size={12} />
                                                Registered
                                            </span>

                                        </div>

                                        <div className="fas-detail-divider" />

                                        <div className="fas-account-detail">

                                            <div className="fas-detail-icon">
                                                <UserRound size={17} />
                                            </div>

                                            <div className="fas-detail-content">
                                                <span>Username</span>

                                                <strong>
                                                    {account.username
                                                        ? `@${account.username}`
                                                        : "Not set"}
                                                </strong>

                                                <small>
                                                    Update your username on
                                                    the Profile page.
                                                </small>
                                            </div>

                                        </div>

                                        {memberSince && (
                                            <>
                                                <div className="fas-detail-divider" />

                                                <div className="fas-account-detail">

                                                    <div className="fas-detail-icon">
                                                        <CalendarDays size={17} />
                                                    </div>

                                                    <div className="fas-detail-content">
                                                        <span>Member since</span>

                                                        <strong>
                                                            {memberSince}
                                                        </strong>
                                                    </div>

                                                </div>
                                            </>
                                        )}

                                    </div>
                                </section>

                                {/* Two-Factor Authentication */}
                                <section className="fas-section">

                                    <div className="fas-panel-heading">

                                        <div>
                                            <h2>Login Security</h2>

                                            <p>
                                                Protect your account with an
                                                additional email verification step.
                                            </p>
                                        </div>

                                        <span className="fas-heading-icon">
                                            <ShieldCheck size={20} />
                                        </span>

                                    </div>

                                    <div className="fas-section-body">
                                        <TwoFactorSettings />
                                    </div>

                                </section>

                                {/* Change password - separate from preferences form */}
                                <section className="fas-section fas-password-section">

                                    <div className="fas-panel-heading">

                                        <div>
                                            <h2>Change Password</h2>

                                            <p>
                                                Enter your current password
                                                and choose a new password.
                                            </p>
                                        </div>

                                        <span className="fas-heading-icon">
                                            <KeyRound size={20} />
                                        </span>

                                    </div>

                                    <div className="fas-section-body">

                                        <form
                                            className="fas-password-form"
                                            onSubmit={handlePasswordChange}
                                        >

                                            {/* Current password */}
                                            <div className="fas-password-group">

                                                <label htmlFor="fas-current-password">
                                                    Current Password *
                                                </label>

                                                <div className="fas-password-input-wrapper">

                                                    <input
                                                        id="fas-current-password"
                                                        type={
                                                            showCurrentPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        value={currentPassword}
                                                        onChange={(event) =>
                                                            handlePasswordInput(
                                                                setCurrentPassword,
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Enter your current password"
                                                        autoComplete="current-password"
                                                        disabled={saving}
                                                        required
                                                    />

                                                    <button
                                                        type="button"
                                                        className="fas-password-toggle"
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
                                            <div className="fas-password-group">

                                                <label htmlFor="fas-new-password">
                                                    New Password *
                                                </label>

                                                <div className="fas-password-input-wrapper">

                                                    <input
                                                        id="fas-new-password"
                                                        type={
                                                            showNewPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        value={newPassword}
                                                        onChange={(event) =>
                                                            handlePasswordInput(
                                                                setNewPassword,
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Enter your new password"
                                                        autoComplete="new-password"
                                                        disabled={saving}
                                                        required
                                                        minLength={8}
                                                    />

                                                    <button
                                                        type="button"
                                                        className="fas-password-toggle"
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
                                            <div className="fas-password-group">

                                                <label htmlFor="fas-confirm-password">
                                                    Confirm New Password *
                                                </label>

                                                <div className="fas-password-input-wrapper">

                                                    <input
                                                        id="fas-confirm-password"
                                                        type={
                                                            showConfirmPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        value={confirmPassword}
                                                        onChange={(event) =>
                                                            handlePasswordInput(
                                                                setConfirmPassword,
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Confirm your new password"
                                                        autoComplete="new-password"
                                                        disabled={saving}
                                                        required
                                                    />

                                                    <button
                                                        type="button"
                                                        className="fas-password-toggle"
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
                                            <div className="fas-password-guidance">
                                                <LockKeyhole size={17} />

                                                <p>
                                                    For your protection, you
                                                    will be asked to log in
                                                    again after changing your
                                                    password.
                                                </p>
                                            </div>

                                            {/* Password actions */}
                                            <div className="fas-password-actions">

                                                <button
                                                    type="button"
                                                    className="fas-secondary-button"
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
                                                    className="fas-primary-button"
                                                    disabled={saving}
                                                >
                                                    {saving ? (
                                                        <>
                                                            <LoaderCircle
                                                                size={16}
                                                                className="fas-loading-icon"
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

                                {/* Main preferences form */}
                                <form
                                    className="fas-settings-form"
                                    onSubmit={handleSaveSettings}
                                >

                                    {/* Regional preferences */}
                                    <section className="fas-section">

                                        <div className="fas-panel-heading">

                                            <div>
                                                <h2>Regional Preferences</h2>

                                                <p>
                                                    Choose how dates, time and
                                                    currency are displayed.
                                                </p>
                                            </div>

                                            <span className="fas-heading-icon">
                                                <Globe size={20} />
                                            </span>

                                        </div>

                                        <div className="fas-section-body">

                                            <div className="fas-grid">

                                                <div className="fas-form-group">
                                                    <label htmlFor="fas-language">
                                                        <Globe size={14} />
                                                        Language
                                                    </label>

                                                    <select
                                                        id="fas-language"
                                                        value={preferences.language}
                                                        onChange={(event) =>
                                                            updatePreference(
                                                                "language",
                                                                event.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="en-ZA">
                                                            English (South Africa)
                                                        </option>

                                                        <option value="en-GB">
                                                            English (United Kingdom)
                                                        </option>

                                                        <option value="en-US">
                                                            English (United States)
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="fas-form-group">
                                                    <label htmlFor="fas-timezone">
                                                        <Clock size={14} />
                                                        Time Zone
                                                    </label>

                                                    <select
                                                        id="fas-timezone"
                                                        value={preferences.timezone}
                                                        onChange={(event) =>
                                                            updatePreference(
                                                                "timezone",
                                                                event.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="Africa/Johannesburg">
                                                            South Africa (SAST)
                                                        </option>

                                                        <option value="Europe/London">
                                                            London
                                                        </option>

                                                        <option value="America/New_York">
                                                            New York
                                                        </option>

                                                        <option value="America/Los_Angeles">
                                                            Los Angeles
                                                        </option>

                                                        <option value="Asia/Dubai">
                                                            Dubai
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="fas-form-group">
                                                    <label htmlFor="fas-currency">
                                                        <Coins size={14} />
                                                        Preferred Currency
                                                    </label>

                                                    <select
                                                        id="fas-currency"
                                                        value={preferences.currency}
                                                        onChange={(event) =>
                                                            updatePreference(
                                                                "currency",
                                                                event.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="ZAR">
                                                            ZAR - South African Rand
                                                        </option>

                                                        <option value="USD">
                                                            USD - US Dollar
                                                        </option>

                                                        <option value="GBP">
                                                            GBP - British Pound
                                                        </option>

                                                        <option value="EUR">
                                                            EUR - Euro
                                                        </option>

                                                        <option value="BWP">
                                                            BWP - Botswana Pula
                                                        </option>
                                                    </select>

                                                    <small>
                                                        This preference does not
                                                        convert existing prices
                                                        or transaction amounts.
                                                    </small>
                                                </div>

                                                <div className="fas-form-group">
                                                    <label htmlFor="fas-date-format">
                                                        <CalendarDays size={14} />
                                                        Date Format
                                                    </label>

                                                    <select
                                                        id="fas-date-format"
                                                        value={preferences.dateFormat}
                                                        onChange={(event) =>
                                                            updatePreference(
                                                                "dateFormat",
                                                                event.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="DD/MM/YYYY">
                                                            DD/MM/YYYY
                                                        </option>

                                                        <option value="MM/DD/YYYY">
                                                            MM/DD/YYYY
                                                        </option>

                                                        <option value="YYYY-MM-DD">
                                                            YYYY-MM-DD
                                                        </option>
                                                    </select>
                                                </div>

                                            </div>
                                        </div>
                                    </section>

                                    {/* Display preferences */}
                                    <section className="fas-section">

                                        <div className="fas-panel-heading">

                                            <div>
                                                <h2>Display Preferences</h2>

                                                <p>
                                                    Choose the appearance you
                                                    prefer for your workspace.
                                                </p>
                                            </div>

                                            <span className="fas-heading-icon">
                                                <Monitor size={20} />
                                            </span>

                                        </div>

                                        <div className="fas-section-body">

                                            <div className="fas-theme-options">

                                                {[
                                                    {
                                                        value: "light",
                                                        label: "Light",
                                                        description:
                                                            "A bright, clean workspace"
                                                    },
                                                    {
                                                        value: "dark",
                                                        label: "Dark",
                                                        description:
                                                            "A darker workspace"
                                                    },
                                                    {
                                                        value: "system",
                                                        label: "System",
                                                        description:
                                                            "Follow your device settings"
                                                    }
                                                ].map((theme) => (
                                                    <label
                                                        key={theme.value}
                                                        className={
                                                            preferences.theme === theme.value
                                                                ? "fas-theme-option is-selected"
                                                                : "fas-theme-option"
                                                        }
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="fas-theme"
                                                            value={theme.value}
                                                            checked={
                                                                preferences.theme === theme.value
                                                            }
                                                            onChange={() =>
                                                                updatePreference(
                                                                    "theme",
                                                                    theme.value
                                                                )
                                                            }
                                                        />

                                                        <span className="fas-theme-radio" />

                                                        <span className="fas-theme-text">
                                                            <strong>
                                                                {theme.label}
                                                            </strong>

                                                            <small>
                                                                {theme.description}
                                                            </small>
                                                        </span>
                                                    </label>
                                                ))}

                                            </div>

                                            <p className="fas-field-note">
                                                Saving a theme preference does
                                                not change the website's
                                                appearance until theme switching
                                                is connected to the application.
                                            </p>

                                        </div>
                                    </section>

                                    {/* Email preferences */}
                                    <section className="fas-section">

                                        <div className="fas-panel-heading">

                                            <div>
                                                <h2>Email Preferences</h2>

                                                <p>
                                                    Choose the types of optional
                                                    email updates you prefer.
                                                </p>
                                            </div>

                                            <span className="fas-heading-icon">
                                                <Bell size={20} />
                                            </span>

                                        </div>

                                        <div className="fas-section-body">

                                            <label className="fas-toggle-row">

                                                <span className="fas-toggle-copy">
                                                    <strong>
                                                        Account and service updates
                                                    </strong>

                                                    <small>
                                                        Optional updates about
                                                        platform features and
                                                        account activity.
                                                    </small>
                                                </span>

                                                <input
                                                    className="fas-toggle-input"
                                                    type="checkbox"
                                                    checked={preferences.emailUpdates}
                                                    onChange={(event) =>
                                                        updatePreference(
                                                            "emailUpdates",
                                                            event.target.checked
                                                        )
                                                    }
                                                    aria-label="Enable account and service email preferences"
                                                />

                                                <span className="fas-toggle-track" />

                                            </label>

                                            <div className="fas-detail-divider" />

                                            <label className="fas-toggle-row">

                                                <span className="fas-toggle-copy">
                                                    <strong>
                                                        Product news and tips
                                                    </strong>

                                                    <small>
                                                        Optional announcements,
                                                        tips and platform news.
                                                    </small>
                                                </span>

                                                <input
                                                    className="fas-toggle-input"
                                                    type="checkbox"
                                                    checked={preferences.productUpdates}
                                                    onChange={(event) =>
                                                        updatePreference(
                                                            "productUpdates",
                                                            event.target.checked
                                                        )
                                                    }
                                                    aria-label="Enable product news and tips"
                                                />

                                                <span className="fas-toggle-track" />

                                            </label>

                                            <p className="fas-field-note">
                                                These switches currently save
                                                your browser preferences only.
                                                They do not change server-side
                                                email subscriptions.
                                            </p>

                                        </div>
                                    </section>

                                    {/* Account management */}
                                    <section className="fas-section fas-account-actions">

                                        <div className="fas-panel-heading">

                                            <div>
                                                <h2>Account Management</h2>

                                                <p>
                                                    Manage your account or get
                                                    assistance.
                                                </p>
                                            </div>

                                            <span className="fas-heading-icon">
                                                <Settings size={20} />
                                            </span>

                                        </div>

                                        <div className="fas-section-body">

                                            <div className="fas-management-row">

                                                <div>
                                                    <strong>
                                                        Need to update your profile?
                                                    </strong>

                                                    <p>
                                                        Change your name,
                                                        professional details,
                                                        skills and online presence.
                                                    </p>
                                                </div>

                                                <Link
                                                    to="/freelancer/profile"
                                                    className="fas-secondary-button"
                                                >
                                                    Edit Profile
                                                </Link>

                                            </div>

                                            <div className="fas-detail-divider" />

                                            <div className="fas-management-row">

                                                <div>
                                                    <strong>
                                                        Want to manage account security?
                                                    </strong>

                                                    <p>
                                                        Visit Security to manage
                                                        the security options
                                                        supported by your account.
                                                    </p>
                                                </div>

                                                <Link
                                                    to="/freelancer/security"
                                                    className="fas-secondary-button"
                                                >
                                                    <ShieldCheck size={15} />
                                                    Security
                                                </Link>

                                            </div>

                                            <div className="fas-detail-divider" />

                                            <div className="fas-management-row">

                                                <div>
                                                    <strong>
                                                        Close or deactivate your account
                                                    </strong>

                                                    <p>
                                                        Contact support to request
                                                        account closure. This page
                                                        will not delete your account.
                                                    </p>
                                                </div>

                                                <Link
                                                    to="/freelancer/help"
                                                    className="fas-danger-outline-button"
                                                >
                                                    <Trash2 size={15} />
                                                    Contact Support
                                                </Link>

                                            </div>

                                        </div>
                                    </section>

                                    {/* Preferences form actions */}
                                    <div className="fas-form-actions">

                                        <button
                                            type="button"
                                            className="fas-secondary-button"
                                            onClick={handleResetSettings}
                                            disabled={saving}
                                        >
                                            <RotateCcw size={15} />
                                            Reset Preferences
                                        </button>

                                        <button
                                            type="submit"
                                            className="fas-primary-button"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <LoaderCircle
                                                        size={16}
                                                        className="fas-loading-icon"
                                                    />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    Save Settings
                                                </>
                                            )}
                                        </button>

                                    </div>

                                </form>
                            </>
                        )}

                    </main>
                </div>
            </div>
        </div>
    );
};

export default FreelancerAccountSettings;
