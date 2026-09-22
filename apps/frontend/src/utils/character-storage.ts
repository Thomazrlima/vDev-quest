import { DEFAULT_MANA_SEED_APPEARANCE, DEFAULT_MANA_SEED_COLORS } from "@/mocks/data/mana-seed";
import type { BodyType, ManaSeedAppearance, ManaSeedColors } from "@/types/character";

export type StoredCharacter = {
    name: string;
    appearance: ManaSeedAppearance;
    colors: ManaSeedColors;
    bodyType: BodyType;
};

export const DEFAULT_CHARACTER: StoredCharacter = {
    name: "Seu Nome",
    appearance: DEFAULT_MANA_SEED_APPEARANCE,
    colors: DEFAULT_MANA_SEED_COLORS,
    bodyType: "hero",
};
