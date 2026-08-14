import { LOBBY_CORRIDORS, LOBBY_DESTINATIONS, LOBBY_MAP } from "@/mocks/data/lobby-map";
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

export const IDLE_FRAME: Record<LobbyDirection, number> = { down: 0, up: 16, left: 32, right: 32 };

export const WALK_FRAMES: Record<LobbyDirection, readonly number[]> = {
    down: [48, 49, 50, 49],
    up: [52, 53, 54, 53],
    left: [64, 65, 66, 65],
    right: [64, 65, 66, 65],
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

export function walkFrame(direction: LobbyDirection, time: number) {
    const frames = WALK_FRAMES[direction];
    return frames[Math.floor(time / 130) % frames.length];
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
