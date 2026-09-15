import { useEffect, useReducer } from "react";
import { getManaSeedTexture, getManaSeedVisibleTexture, loadManaSeedTexture } from "@/components/ManaSeed/textures";
import { getManaSeedFramePosition, getManaSeedLayers } from "@/utils/mana-seed";
import type { ManaSeedLayer } from "@/types/character";

type ManaSeedSpriteLayersProps = {
    frame: number;
    layers?: readonly ManaSeedLayer[];
    /** Mirrors the cell horizontally — the pack draws side poses facing right only. */
    flipped?: boolean;
};

export function ManaSeedSpriteLayers({ frame, layers = getManaSeedLayers(), flipped = false }: ManaSeedSpriteLayersProps) {
    const framePosition = getManaSeedFramePosition(frame);
    const [, redraw] = useReducer((tick: number) => tick + 1, 0);

    // Recoloured sheets are produced off-thread and cached, so this settles after the first pass
    // for a given set of ramps and every later render short-circuits on the empty `missing` list.
    useEffect(() => {
        const missing = layers.filter((layer) => getManaSeedTexture(layer) === null);
        if (missing.length === 0) return;
        let active = true;
        void Promise.all(missing.map(loadManaSeedTexture)).then(() => {
            if (active) redraw();
        });
        return () => {
            active = false;
        };
    }, [layers]);

    return (
        <>
            {layers.map((layer) => (
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 block bg-no-repeat [image-rendering:pixelated]" key={layer.src} style={{ backgroundImage: `url('${getManaSeedVisibleTexture(layer)}')`, ...framePosition, transform: flipped ? "scaleX(-1)" : undefined }} />
            ))}
        </>
    );
}
