/** Como o jogador circula pelo app: andando pelo vilarejo, ou por um menu fixo. */
export type NavigationMode = "map" | "navbar";

export const NAVIGATION_MODE_KEY = "vdev-quest-navigation-mode";
export const NAVIGATION_MODE_EVENT = "vdev-quest-navigation-mode-updated";

/** O vilarejo é a porta de entrada pensada para o jogo; a barra é a saída para quem prefere ir direto. */
export const DEFAULT_NAVIGATION_MODE: NavigationMode = "map";

export function readNavigationMode(): NavigationMode {
    try {
        return window.localStorage.getItem(NAVIGATION_MODE_KEY) === "navbar" ? "navbar" : DEFAULT_NAVIGATION_MODE;
    } catch {
        // localStorage indisponível (modo privado/quota): o vilarejo dá conta.
        return DEFAULT_NAVIGATION_MODE;
    }
}

export function saveNavigationMode(mode: NavigationMode) {
    try {
        window.localStorage.setItem(NAVIGATION_MODE_KEY, mode);
    } catch {
        // Sem gravar, a escolha vale só para esta sessão — o evento abaixo já a aplica na tela.
    }
    window.dispatchEvent(new CustomEvent(NAVIGATION_MODE_EVENT, { detail: mode }));
}
