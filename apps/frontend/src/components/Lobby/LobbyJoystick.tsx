import type { RefObject } from "react";

/** Raio útil do manche, em px de tela. */
export const JOYSTICK_RADIUS = 52;
/** Arrasto menor que isso ainda conta como toque simples, não como manche. */
export const JOYSTICK_DEADZONE = 12;

/**
 * Manche flutuante no estilo Pony Town: a base nasce onde o dedo encostou em vez
 * de ficar num canto fixo. Base e manopla são movidas por ref, junto com o loop
 * de ponteiro — nunca por estado do React.
 */
export function LobbyJoystick({ baseRef, knobRef }: { baseRef: RefObject<HTMLDivElement | null>; knobRef: RefObject<HTMLSpanElement | null> }) {
    return (
        <div aria-hidden="true" className="lobby-joystick" ref={baseRef} style={{ width: JOYSTICK_RADIUS * 2, height: JOYSTICK_RADIUS * 2 }}>
            <span className="lobby-joystick__knob" ref={knobRef} />
        </div>
    );
}
