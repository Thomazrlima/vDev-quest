import { getManaSeedFramePosition, getManaSeedLayers } from "@/utils/mana-seed";

type ManaSeedSpriteLayersProps = {
    frame: number;
    layers?: readonly string[];
};

export function ManaSeedSpriteLayers({ frame, layers = getManaSeedLayers() }: ManaSeedSpriteLayersProps) {
    const framePosition = getManaSeedFramePosition(frame);

    return (
        <>
            {layers.map((src) => (
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 block bg-no-repeat [image-rendering:pixelated]" key={src} style={{ backgroundImage: `url('${src}')`, ...framePosition }} />
            ))}
        </>
    );
}
