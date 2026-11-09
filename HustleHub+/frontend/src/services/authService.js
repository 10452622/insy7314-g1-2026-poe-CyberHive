
const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    'https://localhost:5000'; /* //(MDN Web Docs, 2026) */


export async function registerUser(userData) {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
            method: 'POST', /* //(MDN Web Docs, 2026) */

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(userData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        const validationMessage =
            data.errors?.[0]?.message; /* //(MDN Web Docs, 2026) */

        throw new Error(
            validationMessage ||
            data.message ||
            'Registration failed. Please try again.'
        );
    }

    return data;
}


export async function loginUser(credentials) {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json' /* //(MDN Web Docs, 2026) */
            },

            body: JSON.stringify(credentials)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Login failed. Please try again.'
        );
    }

    return data;
}


export async function requestPasswordReset(email) { /* //(MDN Web Docs, 2026) */
    const response = await fetch(
        `${API_BASE_URL}/api/auth/forgot-password`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                email
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Unable to process the password reset request.'
        );
    } /* //(MDN Web Docs, 2026) */

    return data;
}


// Verify login using an authenticator app or recovery code.
export async function verifyLoginTOTP(
    challengeToken,
    token,
    recoveryCode
) {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/verify-totp`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                challengeToken,
                ...(recoveryCode
                    ? { recoveryCode }
                    : { token })
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Authenticator verification failed. Please try again.'
        );
    }

    return data;
}


/* Reference List:
    1. MDN Web Docs, 2026. Resources for Developers, by Developers. [online] Available at: <https://developer.mozilla.org/en-US/> [Accessed 8 October 2026].
*/
