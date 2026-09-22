import { type ReactNode, useEffect, useState } from "react";
import type { User } from "oidc-client-ts";
import { completeOidcCallback, isOidcCallback, userManager } from "@/auth/oidc";
import { AuthContext } from "@/auth/context";
import { queryClient } from "@/api/queryClient";

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
        // A renovação silenciosa dispara userLoaded. O usuário é o mesmo, só o token mudou;
        // manter o cache evita remontar toda a jornada a cada renovação de sessão.
        const onLoaded = (next: User) => { setUser(next); setError(null); };
        const onUnloaded = () => { queryClient.clear(); setUser(null); setError(null); };
        const onExpired = () => { queryClient.clear(); setUser(null); setError("Sua sessão expirou. Entre novamente para continuar."); };
        userManager.events.addUserLoaded(onLoaded);
        userManager.events.addUserUnloaded(onUnloaded);
        userManager.events.addAccessTokenExpired(onExpired);
        return () => {
            active = false;
            userManager.events.removeUserLoaded(onLoaded);
            userManager.events.removeUserUnloaded(onUnloaded);
            userManager.events.removeAccessTokenExpired(onExpired);
        };
    }, []);

    return <AuthContext.Provider value={{ ready, accessToken: user?.access_token ?? null, error, signIn: async () => {
        setError(null);
        try {
            await userManager.signinRedirect();
        } catch (cause) {
            setError(cause instanceof Error ? `Não foi possível iniciar o login: ${cause.message}` : "Não foi possível iniciar o login. Tente novamente.");
        }
    }, signOut: () => { queryClient.clear(); return userManager.signoutRedirect(); } }}>{children}</AuthContext.Provider>;
}
