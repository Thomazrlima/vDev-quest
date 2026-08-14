import { LOBBY_CORRIDORS } from "@/mocks/data/lobby-map";
import type { LobbyPoint } from "@/types/lobby";
import { closestPointOnSegment, isWalkable } from "@/utils/lobby-navigation";

/** Passo de amostragem ao testar se uma reta cabe na malha (px nativos). */
const SAMPLE_STEP = 7;
/** Endpoints mais próximos que isso viram um nó só. */
const MERGE_DISTANCE = 6;
/** Quão longe da estrada um toque ainda é aceito e puxado para a malha. */
const SNAP_RADIUS = 110;

function distance(a: LobbyPoint, b: LobbyPoint) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

/** A reta de A até B fica inteira dentro da malha caminhável? */
export function isClearPath(a: LobbyPoint, b: LobbyPoint) {
    const steps = Math.max(1, Math.ceil(distance(a, b) / SAMPLE_STEP));
    for (let step = 0; step <= steps; step += 1) {
        const t = step / steps;
        if (!isWalkable({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })) {
            return false;
        }
    }
    return true;
}

/**
 * Grafo de visibilidade sobre as pontas dos corredores. As estradas são poucas e
 * fixas, então isso é calculado uma única vez na carga do módulo: em tempo de
 * execução sobra apenas ligar origem e destino e rodar Dijkstra.
 */
const NODES: readonly LobbyPoint[] = (() => {
    const nodes: LobbyPoint[] = [];
    for (const corridor of LOBBY_CORRIDORS) {
        for (const point of [corridor.a, corridor.b]) {
            if (!nodes.some((node) => distance(node, point) < MERGE_DISTANCE)) {
                nodes.push(point);
            }
        }
    }
    return nodes;
})();

const NEIGHBOURS: readonly (readonly number[])[] = NODES.map((from, index) =>
    NODES.reduce<number[]>((links, to, target) => {
        if (target !== index && isClearPath(from, to)) links.push(target);
        return links;
    }, []),
);

/** Puxa um toque fora da estrada para o ponto caminhável mais próximo. */
export function snapToNavmesh(point: LobbyPoint): LobbyPoint | null {
    if (isWalkable(point)) return point;

    let best: LobbyPoint | null = null;
    let bestDistance = Infinity;
    for (const corridor of LOBBY_CORRIDORS) {
        const closest = closestPointOnSegment(point, corridor.a, corridor.b);
        const gap = distance(point, closest);
        if (gap < bestDistance) {
            bestDistance = gap;
            best = closest;
        }
    }

    return best && bestDistance <= SNAP_RADIUS ? best : null;
}

/**
 * Lista de destinos intermediários de `from` até `to`. Vazia quando não há
 * caminho — o chamador simplesmente ignora o toque.
 */
export function findLobbyPath(from: LobbyPoint, to: LobbyPoint): LobbyPoint[] {
    if (isClearPath(from, to)) return [to];

    const entries = NODES.reduce<number[]>((list, node, index) => {
        if (isClearPath(from, node)) list.push(index);
        return list;
    }, []);
    const exits = NODES.reduce<number[]>((list, node, index) => {
        if (isClearPath(node, to)) list.push(index);
        return list;
    }, []);
    if (!entries.length || !exits.length) return [];

    const cost = NODES.map(() => Infinity);
    const previous = NODES.map(() => -1);
    const visited = new Set<number>();
    for (const index of entries) cost[index] = distance(from, NODES[index]);

    for (;;) {
        let current = -1;
        let currentCost = Infinity;
        for (let index = 0; index < NODES.length; index += 1) {
            if (!visited.has(index) && cost[index] < currentCost) {
                currentCost = cost[index];
                current = index;
            }
        }
        if (current < 0) break;

        visited.add(current);
        for (const next of NEIGHBOURS[current]) {
            const candidate = currentCost + distance(NODES[current], NODES[next]);
            if (candidate < cost[next]) {
                cost[next] = candidate;
                previous[next] = current;
            }
        }
    }

    let goal = -1;
    let goalCost = Infinity;
    for (const index of exits) {
        const total = cost[index] + distance(NODES[index], to);
        if (total < goalCost) {
            goalCost = total;
            goal = index;
        }
    }
    if (goal < 0 || !Number.isFinite(goalCost)) return [];

    const waypoints: LobbyPoint[] = [];
    for (let index = goal; index >= 0; index = previous[index]) {
        waypoints.unshift(NODES[index]);
    }
    waypoints.push(to);
    return waypoints;
}
