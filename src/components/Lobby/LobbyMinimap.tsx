import type { RefObject } from "react";
import { LOBBY_DESTINATIONS, LOBBY_MAP } from "@/mocks/data/lobby-map";

const MINIMAP_SIZE = 148;

export const MINIMAP_SCALE = MINIMAP_SIZE / LOBBY_MAP.size;

/**
 * A câmera fica ampliada e esconde os outros destinos, então o minimapa é quem
 * responde "para onde eu vou agora?". O ponto do jogador é movido por ref, junto
 * com o loop de animação — nunca por estado do React.
 */
export function LobbyMinimap({ dotRef }: { dotRef: RefObject<HTMLSpanElement | null> }) {
    return (
        <div className="lobby-minimap" aria-hidden="true" style={{ width: `${MINIMAP_SIZE}px`, height: `${MINIMAP_SIZE}px` }}>
            <img alt="" className="lobby-minimap__image" height={LOBBY_MAP.size} src={LOBBY_MAP.src} width={LOBBY_MAP.size} />
            {LOBBY_DESTINATIONS.map((destination) => (
                <span className="lobby-minimap__pin" key={destination.href} style={{ left: `${destination.arrival.x * MINIMAP_SCALE}px`, top: `${destination.arrival.y * MINIMAP_SCALE}px` }} />
            ))}
            <span className="lobby-minimap__dot" ref={dotRef} />
        </div>
    );
}
