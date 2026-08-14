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

export type LobbyPlayerPose = { direction: LobbyDirection; frame: number; moving: boolean };
