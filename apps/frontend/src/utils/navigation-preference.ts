/** Como o jogador circula pelo app: andando pelo vilarejo, ou por um menu fixo. */
export type NavigationMode = "map" | "navbar";

export const NAVIGATION_MODE_KEY = "vdev-quest-navigation-mode";
export const NAVIGATION_MODE_EVENT = "vdev-quest-navigation-mode-updated";

/** Usuários sem preferência salva começam pelo fluxo tradicional da aplicação. */
export const DEFAULT_NAVIGATION_MODE: NavigationMode = "navbar";

let volatileNavigationMode: NavigationMode | undefined;

export function readNavigationMode(): NavigationMode {
    try {
        const storedMode = window.localStorage.getItem(NAVIGATION_MODE_KEY);
        return storedMode === "map" || storedMode === "navbar" ? storedMode : (volatileNavigationMode ?? DEFAULT_NAVIGATION_MODE);
    } catch {
        return volatileNavigationMode ?? DEFAULT_NAVIGATION_MODE;
    }
}

export function saveNavigationMode(mode: NavigationMode) {
    volatileNavigationMode = mode;
    try {
        window.localStorage.setItem(NAVIGATION_MODE_KEY, mode);
    } catch {
        // Sem persistência, a escolha ainda vale durante a sessão atual.
    }
    window.dispatchEvent(new CustomEvent(NAVIGATION_MODE_EVENT, { detail: mode }));
}
