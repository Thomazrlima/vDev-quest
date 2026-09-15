import { Backpack, Bell, CornerDownRight, CornerRightDown, CornerRightUp, Crown, GitBranch, Hand, Shield, Shirt, Sunglasses, Tent, User } from "pixelarticons/react";
import type { ManaSeedIcon } from "@/types/character";
import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export const MANA_SEED_ICONS: Record<ManaSeedIcon, ComponentType<IconProps>> = {
    hair: User,
    hat: Crown,
    glasses: Sunglasses,
    shirt: Shirt,
    pants: GitBranch,
    overalls: Backpack,
    dress: Bell,
    vest: Shield,
    sock: CornerDownRight,
    shoe: CornerRightDown,
    boot: CornerRightUp,
    glove: Hand,
    cloak: Tent,
};
