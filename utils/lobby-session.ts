export const LOBBY_EXIT_KEY = "vdev-quest-lobby-exit";

/** Guarda por onde o personagem saiu do vilarejo para reaparecer no mesmo ponto ao voltar. */
export function rememberLobbyExit(href: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(LOBBY_EXIT_KEY, href);
  } catch {
    // sessionStorage indisponível (modo privado/quota): o spawn padrão dá conta.
  }
}

export function readLobbyExit(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(LOBBY_EXIT_KEY);
  } catch {
    return null;
  }
}
