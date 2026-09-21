import { createContext } from "react";

export type AuthState = {
    ready: boolean;
    accessToken: string | null;
    error: string | null;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);
