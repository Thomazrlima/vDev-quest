import { manaSeedFramePosition, manaSeedLayersFor } from "@/lib/manaSeed";

type ManaSeedSpriteLayersProps = {
  frame: number;
  layers?: readonly string[];
};

export function ManaSeedSpriteLayers({ frame, layers = manaSeedLayersFor() }: ManaSeedSpriteLayersProps) {
  const framePosition = manaSeedFramePosition(frame);

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
