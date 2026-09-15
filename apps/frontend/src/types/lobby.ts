/** Destinos do vilarejo, tipados para a navegação do TanStack Router. */
export type LobbyHref = "/ranking" | "/perfil" | "/missions";

export type LobbyPoint = { x: number; y: number };

export type LobbyCorridor = { a: LobbyPoint; b: LobbyPoint; width: number };

export type LobbyDestinationIcon = "crown" | "grid" | "scroll";

export type LobbyDestination = {
    href: LobbyHref;
    label: string;
    sign: string;
    icon: LobbyDestinationIcon;
    arrival: LobbyPoint;
    radius: number;
};

export type LobbyDirection = "down" | "up" | "left" | "right";

/** `flipped` é o espelho que o próprio quadro pede (metade do ciclo de caminhada
 *  é desenhada assim); virar o herói para a esquerda é outra coisa, e fica no CSS. */
export type LobbyPlayerPose = { direction: LobbyDirection; frame: number; flipped: boolean; moving: boolean };
