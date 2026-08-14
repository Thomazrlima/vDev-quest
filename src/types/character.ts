export type ManaSeedSlot = "hair" | "headwear" | "face" | "shirt" | "pants" | "overalls" | "skirt" | "outer" | "socks" | "shoes" | "boots" | "hands" | "neck";

export type ManaSeedItem = {
    code: string;
    label: string;
    file: string;
    /** Alternate cut of the same garment with a shaped chest, used by the heroine base. */
    shapedFile?: string;
    /** `_e` hat: hides the hair layer while worn. */
    hidesHair?: boolean;
    /** `_e` hair: hidden whenever any hat is worn. */
    hiddenByHats?: boolean;
    /** Companion sheet on `00undr`, drawn below everything (split parts like cloaks). */
    under?: string;
};

export type ManaSeedIcon = "hair" | "hat" | "glasses" | "shirt" | "pants" | "overalls" | "dress" | "vest" | "sock" | "shoe" | "boot" | "glove" | "cloak";

export type ManaSeedSlotDefinition = {
    slot: ManaSeedSlot;
    label: string;
    /** Layer folder inside `layers/`, numbered in draw order. */
    dir: string;
    /** Position in the 16-layer draw order (bottom to top). */
    order: number;
    icon: ManaSeedIcon;
    items: ManaSeedItem[];
};

export type ManaSeedAppearance = Record<ManaSeedSlot, string | null>;

/** Which ready-made ramp table a sheet's placeholder colours map into. */
export type ManaSeedRampKind = "three" | "four" | "hair" | "skin";

/** Exact colour substitutions to apply to a sheet before drawing it. */
export type ManaSeedRecolor = { from: string; to: string }[];

export type ManaSeedLayer = { src: string; recolor: ManaSeedRecolor };

/** Chosen ramp index per recolourable slot, plus the body's skin tone. */
export type ManaSeedColors = Record<ManaSeedSlot | "skin", number>;

export type ManaSeedFrame = { index: number; flip?: boolean };
export type ManaSeedDirection = "down" | "up" | "left" | "right";
export type ManaSeedPose = "idle" | "walk";

export type BodyType = "hero" | "heroine";
export type CharacterAura = { name: string; color: string; image: string };
export type CharacterPreset = { id: string; label: string; helper: string; icon: ManaSeedIcon; appearance: ManaSeedAppearance; colors: ManaSeedColors };
