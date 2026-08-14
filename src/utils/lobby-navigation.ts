import { LOBBY_CORRIDORS, LOBBY_DESTINATIONS, LOBBY_MAP } from "@/mocks/data/lobby-map";
import { MANA_SEED_POSES } from "@/mocks/data/mana-seed";
import type { ManaSeedFrame } from "@/types/character";
import type { LobbyCorridor, LobbyDestination, LobbyDirection, LobbyPoint } from "@/types/lobby";

const MOVEMENT_KEYS: Record<string, LobbyDirection> = {
    w: "up",
    a: "left",
    s: "down",
    d: "right",
    arrowup: "up",
    arrowleft: "left",
    arrowdown: "down",
    arrowright: "right",
};

/**
 * As poses saem da mesma tabela da oficina de personagem — o ciclo de caminhada
 * tem 6 quadros, e nas vistas de frente e de costas os três últimos são os três
 * primeiros espelhados (é o que faz o herói trocar de perna). O mapa só tem uma
 * folha lateral, virada para a direita: quem cuida do lado esquerdo é o CSS.
 */
export const IDLE_FRAME: Record<LobbyDirection, ManaSeedFrame> = {
    down: MANA_SEED_POSES.idle.down[0],
    up: MANA_SEED_POSES.idle.up[0],
    left: MANA_SEED_POSES.idle.side[0],
    right: MANA_SEED_POSES.idle.side[0],
};

export const WALK_FRAMES: Record<LobbyDirection, readonly ManaSeedFrame[]> = {
    down: MANA_SEED_POSES.walk.down,
    up: MANA_SEED_POSES.walk.up,
    left: MANA_SEED_POSES.walk.side,
    right: MANA_SEED_POSES.walk.side,
};

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export function isMovementKey(key: string) {
    return key in MOVEMENT_KEYS;
}

export function movementVector(keys: Set<string>): LobbyPoint {
    const directions = new Set([...keys].map((key) => MOVEMENT_KEYS[key]));
    const x = Number(directions.has("right")) - Number(directions.has("left"));
    const y = Number(directions.has("down")) - Number(directions.has("up"));
    if (!x && !y) return { x: 0, y: 0 };
    const length = Math.hypot(x, y);
    return { x: x / length, y: y / length };
}

export function directionFromVector(vector: LobbyPoint, fallback: LobbyDirection): LobbyDirection {
    if (!vector.x && !vector.y) return fallback;
    if (Math.abs(vector.x) >= Math.abs(vector.y)) return vector.x > 0 ? "right" : "left";
    return vector.y > 0 ? "down" : "up";
}

export function walkFrame(direction: LobbyDirection, time: number): ManaSeedFrame {
    const frames = WALK_FRAMES[direction];
    return frames[Math.floor(time / MANA_SEED_POSES.walk.frameDuration) % frames.length];
}

/** Ponto do segmento AB mais próximo de P, com o parâmetro já limitado a [0, 1]. */
export function closestPointOnSegment(point: LobbyPoint, a: LobbyPoint, b: LobbyPoint): LobbyPoint {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    if (!lengthSquared) return a;
    const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared, 0, 1);
    return { x: a.x + t * dx, y: a.y + t * dy };
}

export function distanceToSegment(point: LobbyPoint, a: LobbyPoint, b: LobbyPoint) {
    const closest = closestPointOnSegment(point, a, b);
    return Math.hypot(point.x - closest.x, point.y - closest.y);
}

/** Meia-largura útil: a borda da cápsula recuada pelo raio de colisão do jogador. */
function innerRadius(corridor: LobbyCorridor) {
    return Math.max(corridor.width / 2 - LOBBY_MAP.playerRadius, 4);
}

export function isWalkable(point: LobbyPoint) {
    return LOBBY_CORRIDORS.some((corridor) => distanceToSegment(point, corridor.a, corridor.b) <= innerRadius(corridor));
}

/**
 * Devolve a posição válida mais próxima do alvo. Se o alvo saiu da malha, ele é
 * projetado de volta para a borda da cápsula mais próxima — é isso que faz o
 * personagem deslizar ao longo das estradas diagonais em vez de travar na quina.
 */
export function resolveMove(from: LobbyPoint, to: LobbyPoint): LobbyPoint {
    if (isWalkable(to)) return to;

    let best: LobbyPoint | null = null;
    let bestDistance = Infinity;

    for (const corridor of LOBBY_CORRIDORS) {
        const closest = closestPointOnSegment(to, corridor.a, corridor.b);
        const distance = Math.hypot(to.x - closest.x, to.y - closest.y);
        if (distance >= bestDistance) continue;

        const limit = innerRadius(corridor);
        bestDistance = distance;
        best = distance <= limit || distance === 0 ? closest : { x: closest.x + ((to.x - closest.x) / distance) * limit, y: closest.y + ((to.y - closest.y) / distance) * limit };
    }

    return best && isWalkable(best) ? best : from;
}

export function getDestinationForPoint(point: LobbyPoint): LobbyDestination | null {
    return LOBBY_DESTINATIONS.find((destination) => Math.hypot(point.x - destination.arrival.x, point.y - destination.arrival.y) <= destination.radius) ?? null;
}

export function getDestinationByHref(href: string | null): LobbyDestination | null {
    return LOBBY_DESTINATIONS.find((destination) => destination.href === href) ?? null;
}

export function shouldIgnoreKeyboardEvent(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return false;
    const tagName = target.tagName.toLowerCase();
    return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}
