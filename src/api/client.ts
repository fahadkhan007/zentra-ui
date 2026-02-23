import axios from "axios";

// ─── Base URL ────────────────────────────────────────────────────────────────
// In dev, Vite proxy forwards /api → http://127.0.0.1:8000
// In production, set VITE_API_BASE_URL to your Railway backend URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://zentra-ai.up.railway.app";

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
});

// ─── Request Interceptor — attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401 (token expired / invalid) ─────────────
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stored token and redirect to login
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
// NOTE: /auth/login uses OAuth2PasswordRequestForm, so it must be sent as
// application/x-www-form-urlencoded, NOT JSON.
export const authApi = {
    /**
     * Register a new user. Returns { access_token, token_type }.
     */
    signup: (data: { email: string; password: string; name: string }) =>
        apiClient.post<TokenResponse>("/auth/signup", data),

    /**
     * Login. Backend expects form-data (OAuth2PasswordRequestForm).
     * Returns { access_token, token_type }.
     */
    login: (email: string, password: string) => {
        const form = new URLSearchParams();
        form.append("username", email); // OAuth2 spec uses "username" field
        form.append("password", password);
        return apiClient.post<TokenResponse>("/auth/login", form, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
    },

    /** Logout — blacklists the token on the server. */
    logout: () => apiClient.post("/auth/logout"),

    /** Get current authenticated user info. */
    me: () => apiClient.get<{ id: number; email: string }>("/auth/me"),

    /** Request a password-reset email. */
    requestPasswordReset: (email: string) =>
        apiClient.post("/auth/request-password-reset", { email }),

    /** Complete a password reset with the token from email. */
    resetPassword: (token: string, new_password: string) =>
        apiClient.post("/auth/reset-password", { token, new_password }),
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TokenResponse {
    access_token: string;
    token_type: string;
}
