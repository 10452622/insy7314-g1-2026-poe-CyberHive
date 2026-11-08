import { getToken } from "./authSession";

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://localhost:5000"; // (Vite, 2024)

const request = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch( // (Mozilla, 2025)
        `${API_BASE_URL}/api${endpoint}`,
        {
            ...options,
            headers
        }
    );

    let data;

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Something went wrong."
        );
    }

    return data;
};

export const getGigs = async (
    search = "",
    category = ""
) => {
    const params = new URLSearchParams(); // (Mozilla, 2025)

    if (search) {
        params.append("search", search);
    }

    if (category) {
        params.append("category", category);
    }

    const query = params.toString();

    return request(
        `/gigs${query ? `?${query}` : ""}`
    );
};

export const getGigById = async (id) => {
    return request(`/gigs/${id}`);
};

export const createBooking = async (
    gigId,
    requirements
) => {
    return request("/bookings", {
        method: "POST",
        body: JSON.stringify({
            gigId,
            requirements
        })
    });
};

export const getBookingById = async (id) => {
    return request(`/bookings/${id}`);
};

export const getMyBookings = async () => {
    return request("/bookings/my");
};

export const getMyConversations = async () => {
    return request("/messages");
};

export const getConversationMessages = async (
    bookingId
) => {
    return request(`/messages/${bookingId}`);
};

export const sendConversationMessage = async (
    bookingId,
    text
) => {
    return request(`/messages/${bookingId}`, {
        method: "POST",
        body: JSON.stringify({
            text
        })
    });
};

export const getFreelancerGigs = async () => {
    return request("/gigs/my-gigs");
};

export const fetchFreelancerGigs = async () => {
    return getFreelancerGigs();
};

export const fetchOrderDetails = async (id) => {
    return getBookingById(id);
};

export const createGig = async (gigData) => {
    return request("/gigs", {
        method: "POST",
        body: JSON.stringify(gigData)
    });
};

export const updateGig = async (gigId, gigData) => {
    return request(`/gigs/${gigId}`, {
        method: "PUT",
        body: JSON.stringify(gigData)
    });
};

export const deleteGig = async (gigId) => {
    return request(`/gigs/${gigId}`, {
        method: "DELETE"
    });
};

export const setGigActive = async (gigId, isActive) => {
    return request(`/gigs/${gigId}/active`, {
        method: "PATCH",
        body: JSON.stringify({ isActive })
    });
};

export const getFreelancerOrders = async () => {
    return request("/bookings/freelancer");
};

export const fetchFreelancerOrders = async () => {
    return getFreelancerOrders();
};

export const updateOrderStatus = async (bookingId, status) => {
    return request(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
    });
};

export const fetchMyProfile = async () => {
    return request("/users/me");
};

export const updateMyProfile = async (profileData) => {
    return request("/users/me", {
        method: "PATCH",
        body: JSON.stringify(profileData)
    });
};

export const changeMyPassword = async (passwordData) => {
    return request("/users/change-password", {
        method: "PATCH",
        body: JSON.stringify(passwordData)
    });
};

/*Reference List

Mozilla, 2025. JavaScript reference: Standard built-in objects & Fetch API. [online] Available at: https://developer.mozilla.org/ [Accessed: 8 October 2026].

Vite, 2024. Vite: Environment variables and modes. [online] Available at: https://vite.dev/guide/env-and-mode [Accessed: 8 October 2026].
*/