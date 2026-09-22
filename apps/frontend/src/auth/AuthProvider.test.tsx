import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { StrictMode } from "react";
import { act, render, screen } from "@testing-library/react";
import type { User } from "oidc-client-ts";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./useAuth";
import { userManager } from "./oidc";
import { queryClient } from "@/api/queryClient";
import { Route as RootRoute } from "@/pages/index";

function SessionState() {
    const { ready, accessToken, error } = useAuth();
    return <output>{ready ? accessToken ?? error ?? "sem sessão" : "aguardando"}</output>;
}

afterEach(() => {
    window.history.replaceState(null, "", "/");
    queryClient.clear();
});

describe("retorno do SSO", () => {
    test("a rota inicial preserva os parâmetros do callback", () => {
        expect(() => RootRoute.options.beforeLoad?.({ location: { searchStr: "?code=authorization-code&state=oidc-state" } } as never)).not.toThrow();
    });

    test("conclui o callback uma vez mesmo com efeitos duplicados pelo StrictMode", async () => {
        window.history.replaceState(null, "", "/?code=authorization-code&state=oidc-state");
        const callback = spyOn(userManager, "signinRedirectCallback").mockResolvedValue({ access_token: "token-autenticado", expired: false } as User);
        const getUser = spyOn(userManager, "getUser").mockResolvedValue(null);

        render(<StrictMode><AuthProvider><SessionState /></AuthProvider></StrictMode>);

        expect((await screen.findByText("token-autenticado")).textContent).toBe("token-autenticado");
        expect(callback).toHaveBeenCalledTimes(1);
        expect(getUser).not.toHaveBeenCalled();
        expect(window.location.search).toBe("");
        callback.mockRestore();
        getUser.mockRestore();
    });

    test("mantém o cache da jornada ao renovar somente o token", async () => {
        const getUser = spyOn(userManager, "getUser").mockResolvedValue({ access_token: "token-inicial", expired: false } as User);
        render(<AuthProvider><SessionState /></AuthProvider>);
        await screen.findByText("token-inicial");
        queryClient.setQueryData(["profile", "me"], { name: "Aventureiro" });

        await act(async () => { await userManager.events.load({ access_token: "token-renovado", expired: false } as User); });

        expect(queryClient.getQueryData(["profile", "me"])).toEqual({ name: "Aventureiro" });
        getUser.mockRestore();
    });
});
