import { UserManager, WebStorageStateStore, type User } from "oidc-client-ts";

const authority = import.meta.env.VITE_OIDC_AUTHORITY ?? "http://localhost:8180/realms/vdev-quest";

export const userManager = new UserManager({
    authority,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID ?? "vdev-quest-web",
    redirect_uri: `${window.location.origin}/`,
    post_logout_redirect_uri: `${window.location.origin}/`,
    response_type: "code",
    disablePKCE: false,
    scope: "openid profile email",
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
});

let redirectCallback: { url: string; result: Promise<User> } | null = null;

export function isOidcCallback(search: string): boolean {
    const params = new URLSearchParams(search);
    return params.has("state") && (params.has("code") || params.has("error"));
}

export function completeOidcCallback(url: string): Promise<User> {
    if (redirectCallback?.url !== url) {
        redirectCallback = { url, result: userManager.signinRedirectCallback(url) };
    }
    return redirectCallback.result;
}
