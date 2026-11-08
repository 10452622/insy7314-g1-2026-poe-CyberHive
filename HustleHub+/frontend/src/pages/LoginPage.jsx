
import { useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import AuthLayout from '../components/AuthLayout';

import { loginUser } from '../services/authService';
import { saveSession } from '../services/authSession'; /* //(MDN Web Docs, 2026) */

import '../styles/LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); /* //(MDN Web Docs, 2026) */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: ''
    }));

    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email =
        'Email address is required.';
    } else if (
      !emailPattern.test(formData.email.trim())
    ) {
      newErrors.email =
        'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password =
        'Password is required.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setServerError('');
    setIsSubmitting(true);

    try {
      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password
      });

      /*
       * Two-factor authentication:
       * Do not save a normal session yet.
       * The user must verify the emailed OTP first.
       */
      if (response?.requiresTwoFactor) {
        if (!response.challengeToken) {
          throw new Error(
            'The verification request is missing its security token. Please try again.'
          );
        }

        navigate('/verify-otp', {
          replace: true,
          state: {
            challengeToken: response.challengeToken,
            maskedEmail: response.maskedEmail || '',
            from: location.state?.from || null
          }
        });

        return;
      }

      /*
       * Normal login for accounts without 2FA.
       */
      if (!response?.token || !response?.user) {
        throw new Error(
          'Login response is missing account information.'
        );
      }

      const role = String(response.user.role || '')
        .trim()
        .toLowerCase();

      // Save the authenticated session
      saveSession(
        response.token,
        response.user
      );

      // Client navigation
      if (role === 'client') {
        const requestedDestination =
          location.state?.from;

        const allowedDestination =
          typeof requestedDestination === 'string' &&
          (
            requestedDestination.startsWith('/client/') ||
            requestedDestination.startsWith('/booking/')
          );

        navigate(
          allowedDestination
            ? requestedDestination
            : '/client/home',
          { replace: true }
        );

        return;
      }

      // Freelancer landing page
      if (role === 'freelancer') {
        navigate('/freelancer/dashboard', {
          replace: true
        });

        return;
      }

      setServerError(
        'Unable to determine the account role.'
      );

    } catch (error) {
      setServerError(
        error.message ||
        'Unable to login. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }; /* //(MDN Web Docs, 2026) */

  return (
    <AuthLayout>
      <section className="login-card">
        <div className="login-heading">
          <h1>Welcome back!</h1>

          <p>
            Login to your account
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email */}
          <div className="login-form-group">
            <label htmlFor="loginEmail">
              Email Address
            </label>

            <input
              id="loginEmail"
              name="email"
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              disabled={isSubmitting}
            />

            {errors.email && (
              <span
                className="login-error"
                role="alert"
              >
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="login-form-group">
            <div className="login-password-heading">
              <label htmlFor="loginPassword">
                Password
              </label>
            </div>

            <div className="login-password-field">
              <input
                id="loginPassword"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
                disabled={isSubmitting}
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                disabled={isSubmitting}
              >
                {showPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />
                }
              </button>
            </div>

            {errors.password && (
              <span
                className="login-error"
                role="alert"
              >
                {errors.password}
              </span>
            )}

            <div className="forgot-password-row">
              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </div>
          </div>

          {serverError && (
            <p
              className="login-server-error"
              role="alert"
            >
              {serverError}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Logging in...'
              : 'Login'
            }
          </button>
        </form>

        <p className="login-register-text">
          Don't have an account?{' '}

          <Link to="/register">
            Register
          </Link>
        </p>
      </section>
    </AuthLayout>
  );
}

export default LoginPage;

/* Reference List:
    1. MDN Web Docs, 2026. Resources for Developers, by Developers. [online] Available at: <https://developer.mozilla.org/en-US/> [Accessed 8 October 2026].
*/
