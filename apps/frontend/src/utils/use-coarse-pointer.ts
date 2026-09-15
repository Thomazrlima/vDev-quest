import { useEffect, useState } from "react";

const COARSE_QUERY = "(pointer: coarse)";

/** `true` quando o ponteiro principal é um dedo: troca as dicas de teclado por dicas de toque. */
export function useCoarsePointer() {
    const [coarse, setCoarse] = useState(() => window.matchMedia(COARSE_QUERY).matches);

    useEffect(() => {
        const query = window.matchMedia(COARSE_QUERY);
        const update = (event: MediaQueryListEvent) => setCoarse(event.matches);
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
    }, []);

    return coarse;
}
