import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/client";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
    id: string;
    email: string;
    name?: string;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchMe: () => Promise<void>;
    clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
// Uses zustand/persist so the token & user survive page refreshes (localStorage)
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // ── Login ──────────────────────────────────────────────────────────────
            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await authApi.login(email, password);
                    const { access_token } = res.data;

                    // Persist token in localStorage for the axios interceptor
                    localStorage.setItem("access_token", access_token);

                    set({ token: access_token, isLoading: false });

                    // Immediately fetch the user profile so we have name + id
                    await get().fetchMe();
                } catch (err: unknown) {
                    const message = extractError(err);
                    set({ isLoading: false, error: message });
                    throw err; // re-throw so the form can react
                }
            },

            // ── Signup ─────────────────────────────────────────────────────────────
            signup: async (email, password, name) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await authApi.signup({ email, password, name });
                    const { access_token } = res.data;

                    localStorage.setItem("access_token", access_token);

                    set({ token: access_token, isLoading: false });

                    await get().fetchMe();
                } catch (err: unknown) {
                    const message = extractError(err);
                    set({ isLoading: false, error: message });
                    throw err;
                }
            },

            // ── Logout ─────────────────────────────────────────────────────────────
            logout: async () => {
                try {
                    await authApi.logout();
                } catch {
                    // Even if server-side blacklist fails, clear local state
                } finally {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user");
                    set({ user: null, token: null, isAuthenticated: false, error: null });
                }
            },

            // ── Fetch current user ─────────────────────────────────────────────────
            fetchMe: async () => {
                try {
                    const res = await authApi.me();
                    // /auth/me only returns { id, email } — name comes from signup store
                    const user: AuthUser = {
                        id: String(res.data.id),
                        email: res.data.email,
                    };
                    set({ user, isAuthenticated: true });
                } catch {
                    // Token is invalid — clear everything
                    localStorage.removeItem("access_token");
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },

            // ── Clear error ────────────────────────────────────────────────────────
            clearError: () => set({ error: null }),
        }),
        {
            name: "zentra-auth", // localStorage key
            partialize: (state) => ({
                // Only persist token + user, not loading/error state
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// ─── Helper: extract a readable error message from axios errors ───────────────
function extractError(err: unknown): string {
    if (typeof err === "object" && err !== null) {
        // Network error (CORS blocked, server offline, no internet)
        if ("code" in err && (err as { code: string }).code === "ERR_NETWORK") {
            return "Cannot reach the server. Check your connection or try again in a moment.";
        }
        // Axios response error — FastAPI detail field
        if ("response" in err) {
            const axiosErr = err as { response?: { data?: { detail?: string | { msg: string }[] } } };
            const detail = axiosErr.response?.data?.detail;
            if (typeof detail === "string") return detail;
            if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
        }
    }
    return "Something went wrong. Please try again.";
}
