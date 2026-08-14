import { DEFAULT_MANA_SEED_APPEARANCE, EMPTY_MANA_SEED_APPEARANCE, MANA_SEED_SLOTS } from "@/mocks/data/mana-seed";
import type { ManaSeedAppearance } from "@/types/character";
import { getManaSeedItem } from "@/utils/mana-seed";

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

/** Só entra o que ainda existe nas fichas: uma peça renomeada volta como slot vazio, não quebra o avatar. */
function parseAppearance(value: unknown): ManaSeedAppearance | null {
    if (!isRecord(value)) return null;

    const appearance = { ...EMPTY_MANA_SEED_APPEARANCE };
    let recognized = false;
    for (const { slot } of MANA_SEED_SLOTS) {
        const code = value[slot];
        if (typeof code !== "string" || !getManaSeedItem(slot, code)) continue;
        appearance[slot] = code;
        recognized = true;
    }

    return recognized ? appearance : null;
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
