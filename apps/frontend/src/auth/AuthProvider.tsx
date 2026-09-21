import { type ReactNode, useEffect, useState } from "react";
import type { User } from "oidc-client-ts";
import { completeOidcCallback, isOidcCallback, userManager } from "@/auth/oidc";
import { AuthContext } from "@/auth/context";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const initialize = async () => {
            const callback = isOidcCallback(window.location.search);
            try {
                const next = callback
                    ? await completeOidcCallback(window.location.href)
                    : await userManager.getUser();
                if (!active) return;
                setUser(next && !next.expired ? next : null);
                setError(null);
            } catch (cause) {
                if (!active) return;
                setUser(null);
                setError(cause instanceof Error ? `Não foi possível concluir o login: ${cause.message}` : "Não foi possível concluir o login. Tente entrar novamente.");
            } finally {
                if (active) {
                    if (callback) window.history.replaceState(window.history.state, document.title, window.location.pathname);
                    setReady(true);
                }
            }
        };
        void initialize();
        const onLoaded = (next: User) => setUser(next);
        const onUnloaded = () => { setUser(null); setError(null); };
        userManager.events.addUserLoaded(onLoaded);
        userManager.events.addUserUnloaded(onUnloaded);
        return () => {
            active = false;
            userManager.events.removeUserLoaded(onLoaded);
            userManager.events.removeUserUnloaded(onUnloaded);
        };
    }, []);

    return <AuthContext.Provider value={{ ready, accessToken: user?.access_token ?? null, error, signIn: async () => {
        setError(null);
        try {
            await userManager.signinRedirect();
        } catch (cause) {
            setError(cause instanceof Error ? `Não foi possível iniciar o login: ${cause.message}` : "Não foi possível iniciar o login. Tente novamente.");
        }
    }, signOut: () => userManager.signoutRedirect() }}>{children}</AuthContext.Provider>;
}
