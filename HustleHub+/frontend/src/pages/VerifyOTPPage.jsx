
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    ArrowLeft,
    Smartphone,
    KeyRound,
    ArrowLeftRight
} from 'lucide-react';

import AuthLayout from '../components/AuthLayout';

import {
    verifyLoginTOTP
} from '../services/authService';

import { saveSession } from '../services/authSession';

import '../styles/VerifyOTPPage.css';

function VerifyOTPPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const challengeToken = location.state?.challengeToken;
    const requestedDestination = location.state?.from;

    const [otp, setOtp] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');

    const [useRecoveryCode, setUseRecoveryCode] = useState(false);

    const [serverError, setServerError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // A verification page must have a valid login challenge.
    useEffect(() => {
        if (!challengeToken) {
            navigate('/login', { replace: true });
        }
    }, [challengeToken, navigate]);


    // Handle six-digit authenticator codes.
    const handleOTPChange = (event) => {
        const digitsOnly = event.target.value
            .replace(/\D/g, '')
            .slice(0, 6);

        setOtp(digitsOnly);
        setServerError('');
    };


    // Handle recovery codes.
    const handleRecoveryCodeChange = (event) => {
        setRecoveryCode(
            event.target.value
                .replace(/[^a-fA-F0-9]/g, '')
                .slice(0, 16)
                .toUpperCase()
        );

        setServerError('');
    };


    // Preserve the original Client/Freelancer redirect logic.
    const getDestination = (role) => {
        const normalizedRole = String(role || '')
            .trim()
            .toLowerCase();

        if (normalizedRole === 'client') {
            const allowedDestination =
                typeof requestedDestination === 'string' &&
                (
                    requestedDestination.startsWith('/client/') ||
                    requestedDestination.startsWith('/booking/')
                );

            return allowedDestination
                ? requestedDestination
                : '/client/home';
        }

        if (normalizedRole === 'freelancer') {
            return '/freelancer/dashboard';
        }

        return '/login';
    };


    // Verify authenticator or recovery code.
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isVerifying) {
            return;
        }

        if (useRecoveryCode) {
            if (!/^[A-F0-9]{16}$/.test(recoveryCode)) {
                setServerError(
                    'Please enter a valid 16-character recovery code.'
                );
                return;
            }
        } else {
            if (!/^\d{6}$/.test(otp)) {
                setServerError(
                    'Please enter the complete six-digit authenticator code.'
                );
                return;
            }
        }

        setServerError('');
        setIsVerifying(true);

        try {
            const response = await verifyLoginTOTP(
                challengeToken,
                useRecoveryCode ? undefined : otp,
                useRecoveryCode ? recoveryCode : undefined
            );

            if (!response?.token || !response?.user) {
                throw new Error(
                    'Verification was unsuccessful. Please try again.'
                );
            }

            // Create the authenticated session only after verification.
            saveSession(
                response.token,
                response.user
            );

            const destination = getDestination(
                response.user.role
            );

            if (destination === '/login') {
                setServerError(
                    'Unable to determine your account role. Please contact support.'
                );
                return;
            }

            navigate(destination, {
                replace: true
            });

        } catch (error) {
            setServerError(
                error.message ||
                'Unable to verify your code. Please try again.'
            );
        } finally {
            setIsVerifying(false);
        }
    };


    // Switch between authenticator and recovery code.
    const toggleVerificationMethod = () => {
        setUseRecoveryCode(previous => !previous);

        setOtp('');
        setRecoveryCode('');
        setServerError('');
    };


    if (!challengeToken) {
        return null;
    }


    return (
        <AuthLayout>
            <section className="verify-otp-card">

                <div className="verify-otp-icon">
                    <ShieldCheck size={34} />
                </div>

                <div className="verify-otp-heading">
                    <h1>Verify your identity</h1>

                    <p>
                        Two-factor authentication is enabled for your
                        account. Complete the second verification step
                        to continue.
                    </p>
                </div>


                <div className="verify-totp-method">
                    <div className="verify-totp-method-icon">
                        {useRecoveryCode
                            ? <KeyRound size={22} />
                            : <Smartphone size={22} />
                        }
                    </div>

                    <div>
                        <strong>
                            {useRecoveryCode
                                ? 'Recovery code'
                                : 'Authenticator app'
                            }
                        </strong>

                        <p>
                            {useRecoveryCode
                                ? 'Use one of the recovery codes you saved when enabling 2FA.'
                                : 'Open your authenticator app and enter the current six-digit code.'
                            }
                        </p>
                    </div>
                </div>


                <form
                    className="verify-otp-form"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    {!useRecoveryCode ? (
                        <div className="verify-otp-form-group">
                            <label htmlFor="verificationCode">
                                Authenticator Code
                            </label>

                            <input
                                id="verificationCode"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="000000"
                                maxLength={6}
                                value={otp}
                                onChange={handleOTPChange}
                                disabled={isVerifying}
                                aria-label="Six-digit authenticator code"
                                aria-invalid={Boolean(serverError)}
                                autoFocus
                            />

                            <span className="verify-otp-hint">
                                Your authenticator app generates a new
                                code approximately every 30 seconds.
                            </span>
                        </div>
                    ) : (
                        <div className="verify-otp-form-group">
                            <label htmlFor="recoveryCode">
                                Recovery Code
                            </label>

                            <input
                                id="recoveryCode"
                                type="text"
                                placeholder="Enter your recovery code"
                                maxLength={16}
                                value={recoveryCode}
                                onChange={handleRecoveryCodeChange}
                                disabled={isVerifying}
                                autoComplete="off"
                                aria-label="Recovery code"
                                aria-invalid={Boolean(serverError)}
                                autoFocus
                            />

                            <span className="verify-otp-hint">
                                Each recovery code can only be used once.
                            </span>
                        </div>
                    )}


                    {serverError && (
                        <p
                            className="verify-otp-error"
                            role="alert"
                        >
                            {serverError}
                        </p>
                    )}


                    <button
                        type="submit"
                        className="verify-otp-submit"
                        disabled={
                            isVerifying ||
                            (
                                useRecoveryCode
                                    ? recoveryCode.length !== 16
                                    : otp.length !== 6
                            )
                        }
                    >
                        {isVerifying
                            ? 'Verifying...'
                            : 'Verify and Login'
                        }
                    </button>

                </form>


                <div className="verify-otp-resend">
                    <span>
                        {useRecoveryCode
                            ? 'Have access to your authenticator app?'
                            : "Can't access your authenticator app?"
                        }
                    </span>

                    <button
                        type="button"
                        onClick={toggleVerificationMethod}
                        disabled={isVerifying}
                    >
                        <ArrowLeftRight size={15} />

                        {useRecoveryCode
                            ? 'Use Authenticator App'
                            : 'Use Recovery Code'
                        }
                    </button>
                </div>


                <Link
                    to="/login"
                    className="verify-otp-back"
                    onClick={(event) => {
                        event.preventDefault();
                        navigate('/login', { replace: true });
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to Login
                </Link>

            </section>
        </AuthLayout>
    );
}

export default VerifyOTPPage;
