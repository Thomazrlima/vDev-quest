import { BootIcon, CloakIcon, DressIcon, GlassesIcon, GloveIcon, HairIcon, HatIcon, OverallsIcon, PantsIcon, ShirtIcon, ShoeIcon, SockIcon, VestIcon, type IconProps } from "@/components/icons";
import type { ManaSeedIcon } from "@/types/character";
import type { ComponentType } from "react";

export const MANA_SEED_ICONS: Record<ManaSeedIcon, ComponentType<IconProps>> = {
    hair: HairIcon,
    hat: HatIcon,
    glasses: GlassesIcon,
    shirt: ShirtIcon,
    pants: PantsIcon,
    overalls: OverallsIcon,
    dress: DressIcon,
    vest: VestIcon,
    sock: SockIcon,
    shoe: ShoeIcon,
    boot: BootIcon,
    glove: GloveIcon,
    cloak: CloakIcon,
};
