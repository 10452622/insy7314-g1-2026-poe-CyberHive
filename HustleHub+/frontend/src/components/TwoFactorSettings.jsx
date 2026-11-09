
import { useEffect, useState } from 'react';
import {
    ShieldCheck,
    ShieldAlert,
    LockKeyhole,
    LoaderCircle,
    CheckCircle,
    AlertCircle,
    Smartphone,
    KeyRound,
    QrCode,
    Copy,
    Shield
} from 'lucide-react';

import {
    fetchMyProfile,
    startTwoFactorSetup,
    enableTwoFactor,
    disableTwoFactor
} from '../services/api';

import '../styles/TwoFactorSettings.css';

function TwoFactorSettings() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [step, setStep] = useState('status');

    const [currentPassword, setCurrentPassword] = useState('');
    const [otp, setOtp] = useState('');

    const [setupData, setSetupData] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadTwoFactorStatus();
    }, []);

    // Load the user's current 2FA status.
    const loadTwoFactorStatus = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetchMyProfile();

            const profile =
                response?.user ||
                response?.data?.user ||
                response?.data ||
                response;

            setIsEnabled(Boolean(profile?.twoFactorEnabled));
        } catch (err) {
            setError(
                err.message ||
                'Unable to load your two-factor authentication settings.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Start authenticator setup after confirming the password.
    const handleStartSetup = async (event) => {
        event.preventDefault();

        if (!currentPassword.trim()) {
            setError('Please enter your current password.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await startTwoFactorSetup(
                currentPassword
            );

            if (!response?.qrCodeDataURL || !response?.manualKey) {
                throw new Error(
                    'The authenticator setup information could not be generated.'
                );
            }

            setSetupData({
                qrCodeDataURL: response.qrCodeDataURL,
                manualKey: response.manualKey
            });

            setCurrentPassword('');
            setOtp('');
            setStep('verify');

            setSuccess(
                response?.message ||
                'Scan the QR code using your authenticator app, then enter the generated code below.'
            );
        } catch (err) {
            setError(
                err.message ||
                'Unable to start authenticator setup.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Verify the first authenticator code and activate 2FA.
    const handleEnable = async (event) => {
        event.preventDefault();

        if (!/^\d{6}$/.test(otp)) {
            setError('Please enter a valid six-digit authenticator code.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await enableTwoFactor(otp);

            setIsEnabled(
                response?.twoFactorEnabled ?? true
            );

            setRecoveryCodes(
                Array.isArray(response?.recoveryCodes)
                    ? response.recoveryCodes
                    : []
            );

            setOtp('');
            setSetupData(null);

            // Show recovery codes before returning to the status screen.
            setStep('recovery');

            setSuccess(
                response?.message ||
                'Authenticator two-factor authentication has been enabled successfully.'
            );
        } catch (err) {
            setError(
                err.message ||
                'Unable to verify the authenticator code. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Disable 2FA after confirming the current password.
    const handleDisable = async (event) => {
        event.preventDefault();

        if (!currentPassword.trim()) {
            setError('Please enter your current password.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await disableTwoFactor(
                currentPassword
            );

            setIsEnabled(
                response?.twoFactorEnabled ?? false
            );

            setCurrentPassword('');
            setSetupData(null);
            setRecoveryCodes([]);
            setStep('status');

            setSuccess(
                response?.message ||
                'Two-factor authentication has been disabled.'
            );
        } catch (err) {
            setError(
                err.message ||
                'Unable to disable two-factor authentication.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Copy the manual authenticator setup key.
    const handleCopyManualKey = async () => {
        if (!setupData?.manualKey) {
            return;
        }

        try {
            await navigator.clipboard.writeText(setupData.manualKey);
            setSuccess('Authenticator setup key copied successfully.');
            setError('');
        } catch {
            setError(
                'Unable to copy the setup key. Please copy it manually.'
            );
        }
    };

    // Copy all recovery codes.
    const handleCopyRecoveryCodes = async () => {
        if (!recoveryCodes.length) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                recoveryCodes.join('\n')
            );

            setSuccess('Recovery codes copied successfully.');
            setError('');
        } catch {
            setError(
                'Unable to copy the recovery codes. Please copy them manually.'
            );
        }
    };

    // Finish setup after the user has saved their recovery codes.
    const handleFinishRecovery = () => {
        setRecoveryCodes([]);
        setStep('status');
        setError('');
        setSuccess(
            'Your authenticator app is now protecting your account.'
        );
    };

    // Cancel the current action.
    const cancelAction = () => {
        setStep('status');
        setCurrentPassword('');
        setOtp('');
        setSetupData(null);
        setRecoveryCodes([]);
        setError('');
        setSuccess('');
    };

    if (isLoading) {
        return (
            <section className="two-factor-card">
                <div className="two-factor-loading">
                    <LoaderCircle
                        className="two-factor-spinner"
                        size={22}
                    />
                    <span>Loading security settings...</span>
                </div>
            </section>
        );
    }

    return (
        <section className="two-factor-card">

            {/* HEADER */}
            <div className="two-factor-header">
                <div className="two-factor-heading-icon">
                    <ShieldCheck size={23} />
                </div>

                <div>
                    <h3>Two-Factor Authentication</h3>
                    <p>
                        Add an extra layer of security to your HustleHub+ account.
                    </p>
                </div>
            </div>

            {/* STATUS */}
            <div
                className={`two-factor-status ${
                    isEnabled ? 'enabled' : 'disabled'
                }`}
            >
                {isEnabled ? (
                    <CheckCircle size={19} />
                ) : (
                    <ShieldAlert size={19} />
                )}

                <div>
                    <strong>
                        {isEnabled
                            ? 'Two-factor authentication is enabled'
                            : 'Two-factor authentication is disabled'
                        }
                    </strong>

                    <span>
                        {isEnabled
                            ? 'An authenticator code is required when you log in.'
                            : 'Your account currently uses your password only.'
                        }
                    </span>
                </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div
                    className="two-factor-message error"
                    role="alert"
                >
                    <AlertCircle size={17} />
                    <span>{error}</span>
                </div>
            )}

            {/* SUCCESS MESSAGE */}
            {success && (
                <div
                    className="two-factor-message success"
                    role="status"
                >
                    <CheckCircle size={17} />
                    <span>{success}</span>
                </div>
            )}

            {/* =====================================
                DISABLED: INITIAL STATUS
            ===================================== */}
            {!isEnabled && step === 'status' && (
                <div className="two-factor-content">

                    <div className="two-factor-description">
                        <Smartphone size={20} />

                        <p>
                            Use an authenticator app to generate secure
                            verification codes when logging in.
                            You can use apps such as Google Authenticator,
                            Microsoft Authenticator, 2FAS or Proton Authenticator.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="two-factor-primary-btn"
                        onClick={() => {
                            setStep('enable');
                            setError('');
                            setSuccess('');
                        }}
                    >
                        Enable Two-Factor Authentication
                    </button>
                </div>
            )}

            {/* =====================================
                CONFIRM PASSWORD
            ===================================== */}
            {!isEnabled && step === 'enable' && (
                <form
                    className="two-factor-form"
                    onSubmit={handleStartSetup}
                >
                    <div className="two-factor-description">
                        <LockKeyhole size={19} />

                        <p>
                            Confirm your current password before setting
                            up your authenticator app.
                        </p>
                    </div>

                    <label htmlFor="twoFactorEnablePassword">
                        Current Password
                    </label>

                    <div className="two-factor-input-wrapper">
                        <LockKeyhole size={17} />

                        <input
                            id="twoFactorEnablePassword"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter your current password"
                            value={currentPassword}
                            onChange={(event) => {
                                setCurrentPassword(event.target.value);
                                setError('');
                            }}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="two-factor-actions">
                        <button
                            type="button"
                            className="two-factor-secondary-btn"
                            onClick={cancelAction}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="two-factor-primary-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Preparing setup...'
                                : 'Continue'
                            }
                        </button>
                    </div>
                </form>
            )}

            {/* =====================================
                AUTHENTICATOR QR CODE AND VERIFICATION
            ===================================== */}
            {!isEnabled && step === 'verify' && setupData && (
                <div className="two-factor-form">

                    <div className="two-factor-setup-heading">
                        <div className="two-factor-setup-icon">
                            <QrCode size={21} />
                        </div>

                        <div>
                            <h4>Set up your authenticator app</h4>
                            <p>
                                Scan the QR code below using your
                                preferred authenticator app.
                            </p>
                        </div>
                    </div>

                    <div className="two-factor-qr-container">
                        <img
                            src={setupData.qrCodeDataURL}
                            alt="HustleHub+ authenticator setup QR code"
                            className="two-factor-qr-image"
                        />
                    </div>

                    <div className="two-factor-manual-setup">
                        <label>
                            Can't scan the QR code?
                        </label>

                        <p>
                            Enter this setup key manually in your
                            authenticator app.
                        </p>

                        <div className="two-factor-manual-key">
                            <code>{setupData.manualKey}</code>

                            <button
                                type="button"
                                onClick={handleCopyManualKey}
                                title="Copy setup key"
                                aria-label="Copy authenticator setup key"
                            >
                                <Copy size={17} />
                            </button>
                        </div>
                    </div>

                    <div className="two-factor-divider">
                        <span>VERIFY YOUR AUTHENTICATOR</span>
                    </div>

                    <form onSubmit={handleEnable}>
                        <label htmlFor="twoFactorOTP">
                            Six-Digit Authenticator Code
                        </label>

                        <input
                            id="twoFactorOTP"
                            className="two-factor-otp-input"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="000000"
                            value={otp}
                            onChange={(event) => {
                                setOtp(
                                    event.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 6)
                                );
                                setError('');
                            }}
                            disabled={isSubmitting}
                        />

                        <p className="two-factor-hint">
                            Enter the current six-digit code displayed
                            in your authenticator app to confirm setup.
                        </p>

                        <div className="two-factor-actions">
                            <button
                                type="button"
                                className="two-factor-secondary-btn"
                                onClick={cancelAction}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="two-factor-primary-btn"
                                disabled={
                                    isSubmitting ||
                                    otp.length !== 6
                                }
                            >
                                {isSubmitting
                                    ? 'Verifying...'
                                    : 'Verify and Enable'
                                }
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* =====================================
                RECOVERY CODES
            ===================================== */}
            {isEnabled && step === 'recovery' && (
                <div className="two-factor-recovery">

                    <div className="two-factor-recovery-heading">
                        <div className="two-factor-recovery-icon">
                            <KeyRound size={23} />
                        </div>

                        <h4>Save your recovery codes</h4>

                        <p>
                            These codes can be used to access your account
                            if you lose access to your authenticator app.
                        </p>
                    </div>

                    <div className="two-factor-warning">
                        <ShieldAlert size={19} />

                        <p>
                            <strong>Important:</strong> Each recovery code
                            can only be used once. These codes will only
                            be displayed now. Store them somewhere safe.
                        </p>
                    </div>

                    {recoveryCodes.length > 0 ? (
                        <>
                            <div className="two-factor-recovery-list">
                                {recoveryCodes.map((code, index) => (
                                    <div
                                        className="two-factor-recovery-code"
                                        key={`${code}-${index}`}
                                    >
                                        <span>{index + 1}.</span>
                                        <code>{code}</code>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="two-factor-copy-btn"
                                onClick={handleCopyRecoveryCodes}
                            >
                                <Copy size={17} />
                                Copy All Recovery Codes
                            </button>
                        </>
                    ) : (
                        <div className="two-factor-no-recovery">
                            <AlertCircle size={18} />
                            <span>
                                No recovery codes were returned. Please
                                contact support before relying on recovery access.
                            </span>
                        </div>
                    )}

                    <button
                        type="button"
                        className="two-factor-primary-btn two-factor-recovery-confirm"
                        onClick={handleFinishRecovery}
                        disabled={recoveryCodes.length === 0}
                    >
                        I've Saved My Recovery Codes
                    </button>
                </div>
            )}

            {/* =====================================
                ENABLED: STATUS
            ===================================== */}
            {isEnabled && step === 'status' && (
                <div className="two-factor-content">

                    <div className="two-factor-description">
                        <Shield size={20} />

                        <p>
                            Your authenticator app is protecting your
                            account. You will need a verification code
                            when signing in.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="two-factor-danger-btn"
                        onClick={() => {
                            setStep('disable');
                            setError('');
                            setSuccess('');
                        }}
                    >
                        Disable Two-Factor Authentication
                    </button>
                </div>
            )}

            {/* =====================================
                DISABLE: CONFIRM PASSWORD
            ===================================== */}
            {isEnabled && step === 'disable' && (
                <form
                    className="two-factor-form"
                    onSubmit={handleDisable}
                >
                    <div className="two-factor-description">
                        <ShieldAlert size={19} />

                        <p>
                            Disabling two-factor authentication will remove
                            the authenticator requirement and invalidate
                            your existing recovery codes.
                        </p>
                    </div>

                    <label htmlFor="twoFactorDisablePassword">
                        Current Password
                    </label>

                    <div className="two-factor-input-wrapper">
                        <LockKeyhole size={17} />

                        <input
                            id="twoFactorDisablePassword"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter your current password"
                            value={currentPassword}
                            onChange={(event) => {
                                setCurrentPassword(event.target.value);
                                setError('');
                            }}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="two-factor-actions">
                        <button
                            type="button"
                            className="two-factor-secondary-btn"
                            onClick={cancelAction}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="two-factor-danger-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Disabling...'
                                : 'Confirm Disable'
                            }
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}

export default TwoFactorSettings;
