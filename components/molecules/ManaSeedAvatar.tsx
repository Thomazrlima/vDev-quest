import { ManaSeedSpriteLayers } from "@/components/molecules/ManaSeedSpriteLayers";
import { MANA_SEED_FREE } from "@/data/mana-seed";

type ManaSeedAvatarProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
  layers?: readonly string[];
};

const sizes = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-28 w-28 sm:h-32 sm:w-32"
};

export function ManaSeedAvatar({ size = "md", className = "", alt = "Avatar do aventureiro", layers }: ManaSeedAvatarProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`mana-seed-sprite ${sizes[size]} shrink-0 border-[3px] border-gold bg-ink shadow-[4px_4px_0_#070806] ${className}`}
    >
      <div className="mana-seed-avatar-head-frame" aria-hidden="true">
        <ManaSeedSpriteLayers frame={MANA_SEED_FREE.staticAvatarFrame} layers={layers} />
      </div>
    </div>
  );
}
