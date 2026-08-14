import { DEFAULT_MANA_SEED_APPEARANCE, MANA_SEED_FREE } from "@/mocks/data/mana-seed";
import type { ManaSeedAppearance } from "@/types/character";

export const CHARACTER_STORAGE_KEY = "vdev-quest-character";
export const CHARACTER_UPDATED_EVENT = "vdev-quest-character-updated";

export type StoredCharacter = {
    name: string;
    appearance: ManaSeedAppearance;
};

const DEFAULT_CHARACTER: StoredCharacter = {
    name: "Seu Nome",
    appearance: DEFAULT_MANA_SEED_APPEARANCE,
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function hasKey<T extends object>(source: T, key: unknown): key is keyof T {
    return typeof key === "string" && key in source;
}

function parseAppearance(value: unknown): ManaSeedAppearance | null {
    if (!isRecord(value)) return null;
    const { hair, shirt, headwear } = value;
    if (!hasKey(MANA_SEED_FREE.hairstyles, hair)) return null;
    if (!hasKey(MANA_SEED_FREE.shirts, shirt)) return null;
    if (!hasKey(MANA_SEED_FREE.headwear, headwear)) return null;
    return { hair, shirt, headwear };
}

export function readStoredCharacter(): StoredCharacter {
    const stored = window.localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (!stored) return DEFAULT_CHARACTER;

    try {
        const parsed = JSON.parse(stored) as unknown;
        if (!isRecord(parsed)) return DEFAULT_CHARACTER;
        const appearance = parseAppearance(parsed.appearance);
        return {
            name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : DEFAULT_CHARACTER.name,
            appearance: appearance ?? DEFAULT_CHARACTER.appearance,
        };
    } catch {
        return DEFAULT_CHARACTER;
    }
}

export function saveStoredCharacter(character: StoredCharacter) {
    window.localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(character));
    window.dispatchEvent(new CustomEvent(CHARACTER_UPDATED_EVENT, { detail: character }));
}
