"use client";

import React, { createContext, ReactNode } from "react";
import { notifier } from "@/components/notifier";
import { IUser } from "@/interface";
import { useRouter } from "next/navigation";

export interface AuthState {
    user: IUser | null;
    token: string | null;
    loading: boolean;
    error: string | null; // Changed to string | null for render safety
    initialize: () => Promise<void>;
    handleLogout: () => void;
    setAuthState: (user: IUser | null, token: string | null) => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = React.useState<Omit<AuthState, "initialize" | "handleLogout" | "setAuthState">>({
        user: null,
        token: null,
        loading: true,
        error: null,
    });

    const router = useRouter();

    const setAuthState = (user: IUser | null, token: string | null) => {
        try {
            if (user && token) {
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("token", token);
                setState((prev) => ({ ...prev, user, token, loading: false, error: null }));
            } else {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setState((prev) => ({ ...prev, user: null, token: null, loading: false, error: null }));
            }
        } catch (error) {
            console.error("Error setting auth state:", error);
            notifier.error("Failed to set authentication state.", "Auth Error");
            setState((prev) => ({ ...prev, error: (error as Error).message || "Unknown error", loading: false }));
        }
    };

    const handleLogout = () => {
        setState((prev) => ({ ...prev, user: null, token: null, loading: false, error: null }));
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/auth");
    };

    const initialize = async () => {
        try {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            const storedUser = localStorage.getItem("user");
            const storedToken = localStorage.getItem("token");

            if (!storedUser || !storedToken) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setState((prev) => ({ ...prev, user: null, token: null, loading: false }));
                return;
            }

            const user = JSON.parse(storedUser) as IUser;
            const token = storedToken;

            setState((prev) => ({ ...prev, user, token, loading: false }));
        } catch (error) {
            console.error("Initialization error:", error);
            notifier.error("Failed to initialize authentication.", "Authentication Error");
            setState((prev) => ({
                ...prev,
                user: null,
                token: null,
                loading: false,
                error: (error as Error).message || "Initialization failed",
            }));
        }
    };

    React.useEffect(() => {
        initialize();
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, initialize, handleLogout, setAuthState }}>
            {children}
        </AuthContext.Provider>
    );
}