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
        <span
          aria-hidden="true"
          className="mana-seed-sprite-layer"
          key={src}
          style={{ backgroundImage: `url('${src}')`, ...framePosition }}
        />
      ))}
    </>
  );
}
