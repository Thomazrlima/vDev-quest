import { ManaSeedSpriteLayers } from "@/components/ManaSeed/ManaSeedSpriteLayers";
import { MANA_SEED } from "@/mocks/data/mana-seed";
import type { ManaSeedLayer } from "@/types/character";

type ManaSeedAvatarProps = {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    alt?: string;
    layers?: readonly ManaSeedLayer[];
};

const sizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
    xl: "h-28 w-28 sm:h-32 sm:w-32",
};

export function ManaSeedAvatar({ size = "md", className = "", alt = "Avatar do aventureiro", layers }: ManaSeedAvatarProps) {
    return (
        <div role="img" aria-label={alt} className={`relative block isolate overflow-hidden ${sizes[size]} shrink-0 border-[3px] border-primary bg-black shadow-[4px_4px_0_var(--color-black)] [image-rendering:pixelated] ${className}`}>
            <div className="absolute -left-full top-[-58%] h-[300%] w-[300%]" aria-hidden="true">
                <ManaSeedSpriteLayers frame={MANA_SEED.staticAvatarFrame} layers={layers} />
            </div>
        </div>
    );
}
