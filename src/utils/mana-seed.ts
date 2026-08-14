import { DEFAULT_MANA_SEED_APPEARANCE, DEFAULT_MANA_SEED_COLORS, MANA_SEED, MANA_SEED_LEG_SLOTS, MANA_SEED_SLOTS } from "@/mocks/data/mana-seed";
import { MANA_SEED_BASE_RAMPS, MANA_SEED_FOUR_RAMPS, MANA_SEED_HAIR_RAMPS, MANA_SEED_SKIN_RAMPS, MANA_SEED_THREE_RAMPS } from "@/mocks/data/mana-seed-palettes";
import type { BodyType, ManaSeedAppearance, ManaSeedColors, ManaSeedItem, ManaSeedLayer, ManaSeedRampKind, ManaSeedRecolor, ManaSeedSlot, ManaSeedSlotDefinition } from "@/types/character";

const SLOTS_BY_NAME = new Map(MANA_SEED_SLOTS.map((definition) => [definition.slot, definition]));

export const MANA_SEED_RAMPS: Record<ManaSeedRampKind, string[][]> = { three: MANA_SEED_THREE_RAMPS, four: MANA_SEED_FOUR_RAMPS, hair: MANA_SEED_HAIR_RAMPS, skin: MANA_SEED_SKIN_RAMPS };

/** A sheet's placeholder ramp paired with the table its replacement is drawn from. */
type RampLayout = { table: ManaSeedRampKind; base: keyof typeof MANA_SEED_BASE_RAMPS };

export function getManaSeedSlot(slot: ManaSeedSlot) {
    return SLOTS_BY_NAME.get(slot) as ManaSeedSlotDefinition;
}

export function getManaSeedItem(slot: ManaSeedSlot, code: string | null) {
    return code ? (getManaSeedSlot(slot).items.find((item) => item.code === code) ?? null) : null;
}

export function getManaSeedItemLabel(slot: ManaSeedSlot, code: string | null) {
    return getManaSeedItem(slot, code)?.label ?? "Nenhum";
}

/**
 * The trailing version code in a filename declares the sheet's ramp layout — `00a` is one
 * 3-colour ramp, `00d` is a 4-colour plus a 3-colour, and so on. `00` means the sheet uses the
 * skin or hair base ramp, and `01`…`05` are pre-baked colour variants that must not be touched.
 */
function getRampLayout(file: string, skin: boolean): RampLayout[] {
    switch (file.match(/_(\d{2}[a-f]?)(?:_e)?\.png$/)?.[1]) {
        case "00":
            return skin ? [{ table: "skin", base: "skin" }] : [{ table: "hair", base: "hair" }];
        case "00a":
            return [{ table: "three", base: "three" }];
        case "00b":
            return [{ table: "four", base: "four" }];
        case "00c":
            return [
                { table: "three", base: "three" },
                { table: "three", base: "threeB" },
            ];
        case "00d":
            return [
                { table: "four", base: "four" },
                { table: "three", base: "three" },
            ];
        case "00f":
            return [
                { table: "four", base: "four" },
                { table: "hair", base: "hair" },
            ];
        default:
            return [];
    }
}

/** The ramp table a slot's swatches come from, or null when the equipped part ships pre-coloured. */
export function getManaSeedRampKind(slot: ManaSeedSlot | "skin", appearance: ManaSeedAppearance, bodyType: BodyType = "hero") {
    if (slot === "skin") return "skin" as const;
    const item = getManaSeedItem(slot, appearance[slot]);
    if (!item) return null;
    return getRampLayout(pickManaSeedFile(item, bodyType), false)[0]?.table ?? null;
}

function pickManaSeedFile(item: ManaSeedItem, bodyType: BodyType) {
    return bodyType === "heroine" && item.shapedFile ? item.shapedFile : item.file;
}

function buildRecolor(file: string, skin: boolean, index: number): ManaSeedRecolor {
    const pairs: ManaSeedRecolor = [];
    for (const { table, base } of getRampLayout(file, skin)) {
        const ramps = MANA_SEED_RAMPS[table];
        const target = ramps[index % ramps.length];
        MANA_SEED_BASE_RAMPS[base].forEach((from, position) => {
            if (target[position] !== from) pairs.push({ from, to: target[position] });
        });
    }
    return pairs;
}

/** Sheet URL for a part, picking the shaped cut of the garment when the heroine base is active. */
export function getManaSeedItemSrc(definition: ManaSeedSlotDefinition, item: ManaSeedItem, bodyType: BodyType = "hero") {
    return `${MANA_SEED.root}/${definition.dir}/${pickManaSeedFile(item, bodyType)}`;
}

/**
 * Sheets to stack for an appearance, bottom to top, applying the pack's three composition rules:
 * hats flagged `_e` hide the hair, hair flagged `_e` hides itself under any hat, and split parts
 * (the cloaks) also need their companion sheet on the `00undr` layer. Each layer carries the
 * colour substitutions that turn its placeholder ramp into the chosen one.
 */
export function getManaSeedLayers(appearance: ManaSeedAppearance = DEFAULT_MANA_SEED_APPEARANCE, bodyType: BodyType = "hero", colors: ManaSeedColors = DEFAULT_MANA_SEED_COLORS): ManaSeedLayer[] {
    const hat = getManaSeedItem("headwear", appearance.headwear);
    const hair = getManaSeedItem("hair", appearance.hair);
    const hideHair = Boolean(hat) && (hat?.hidesHair === true || hair?.hiddenByHats === true);
    const layers: (ManaSeedLayer & { order: number })[] = [{ order: MANA_SEED.body.order, src: `${MANA_SEED.root}/${MANA_SEED.body.dir}/${MANA_SEED.body.file}`, recolor: buildRecolor(MANA_SEED.body.file, true, colors.skin) }];

    for (const definition of MANA_SEED_SLOTS) {
        if (definition.slot === "hair" && hideHair) continue;
        const item = getManaSeedItem(definition.slot, appearance[definition.slot]);
        if (!item) continue;
        const index = colors[definition.slot];
        if (item.under) layers.push({ order: MANA_SEED.under.order, src: `${MANA_SEED.root}/${MANA_SEED.under.dir}/${item.under}`, recolor: buildRecolor(item.under, false, index) });
        const file = pickManaSeedFile(item, bodyType);
        layers.push({ order: definition.order, src: getManaSeedItemSrc(definition, item, bodyType), recolor: buildRecolor(file, false, index) });
    }

    return layers.sort((a, b) => a.order - b.order).map(({ src, recolor }) => ({ src, recolor }));
}

/** Equipping a leg part clears the other two: pants, overalls and skirts share one physical slot. */
export function setManaSeedSlot(appearance: ManaSeedAppearance, slot: ManaSeedSlot, code: string | null): ManaSeedAppearance {
    const next = { ...appearance, [slot]: code };
    if (code && MANA_SEED_LEG_SLOTS.includes(slot)) for (const other of MANA_SEED_LEG_SLOTS) if (other !== slot) next[other] = null;
    return next;
}

/** Options for a selector: "Nenhum" first, then every part of the slot. */
export function getManaSeedOptions(slot: ManaSeedSlot): (string | null)[] {
    return [null, ...getManaSeedSlot(slot).items.map((item) => item.code)];
}

export function cycleManaSeedSlot(appearance: ManaSeedAppearance, slot: ManaSeedSlot, direction: -1 | 1) {
    const options = getManaSeedOptions(slot);
    const index = options.indexOf(appearance[slot]);
    return setManaSeedSlot(appearance, slot, options[(index + direction + options.length) % options.length]);
}

export function getManaSeedSlotCount(appearance: ManaSeedAppearance, slot: ManaSeedSlot) {
    const options = getManaSeedOptions(slot);
    return `${options.indexOf(appearance[slot]) + 1}/${options.length}`;
}

export function getManaSeedFramePosition(frame: number) {
    const { columns, rows } = MANA_SEED.grid;
    const column = frame % columns;
    const row = Math.floor(frame / columns);
    return { backgroundSize: `${columns * 100}% ${rows * 100}%`, backgroundPosition: `${(column / (columns - 1)) * 100}% ${(row / (rows - 1)) * 100}%` };
}
