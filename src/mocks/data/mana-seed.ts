import type { ManaSeedAppearance, ManaSeedColors, ManaSeedDirection, ManaSeedFrame, ManaSeedPose, ManaSeedSlot, ManaSeedSlotDefinition } from "@/types/character";

/**
 * Mana Seed "Farmer Sprite System" (`fbas_*`) by Seliel the Shaper.
 * One 1024x1024 sheet per part, sliced into 16x16 cells of 64x64.
 * Every layer uses the identical cell arrangement, so one frame index works across all of them.
 */
export const MANA_SEED = {
    grid: { columns: 16, rows: 16, frameWidth: 64, frameHeight: 64 },
    root: "/images/io/farmer-sprite-system/layers",
    body: { dir: "01body-body", file: "fbas_01body_human_00.png", order: 1 },
    under: { dir: "00undr-under-everything", order: 0 },
    staticAvatarFrame: 0,
} as const;

/** Legs are a single physical slot: pants, overalls and skirts can never be worn together. */
export const MANA_SEED_LEG_SLOTS: ManaSeedSlot[] = ["pants", "overalls", "skirt"];

/** Ordered bottom to top — rendering follows this array. */
export const MANA_SEED_SLOTS: ManaSeedSlotDefinition[] = [
    {
        slot: "socks",
        label: "Meias",
        dir: "02sock-legwear",
        order: 2,
        icon: "sock",
        items: [
            { code: "sockslow", label: "Meias curtas", file: "fbas_02sock_sockslow_00a.png" },
            { code: "sockshigh", label: "Meias altas", file: "fbas_02sock_sockshigh_00a.png" },
            { code: "stockings", label: "Meia-calça", file: "fbas_02sock_stockings_00a.png" },
        ],
    },
    {
        slot: "shoes",
        label: "Calçados",
        dir: "03fot1-shoes-under-pants",
        order: 3,
        icon: "shoe",
        items: [
            { code: "shoes", label: "Sapatos", file: "fbas_03fot1_shoes_00a.png" },
            { code: "boots", label: "Botinas", file: "fbas_03fot1_boots_00a.png" },
            { code: "sandals", label: "Sandálias", file: "fbas_03fot1_sandals_00a.png" },
        ],
    },
    {
        slot: "pants",
        label: "Calça",
        dir: "04lwr1-pants-shorts",
        order: 4,
        icon: "pants",
        items: [
            { code: "longpants", label: "Calça longa", file: "fbas_04lwr1_longpants_00a.png" },
            { code: "shorts", label: "Bermuda", file: "fbas_04lwr1_shorts_00a.png" },
            { code: "onepiece", label: "Macaquinho", file: "fbas_04lwr1_onepiece_00a.png", shapedFile: "fbas_04lwr1_onepieceboobs_00a.png" },
            { code: "undies", label: "Roupa de baixo", file: "fbas_04lwr1_undies_00a.png" },
        ],
    },
    {
        slot: "shirt",
        label: "Camisa",
        dir: "05shrt-shirts",
        order: 5,
        icon: "shirt",
        items: [
            { code: "shortshirt", label: "Camisa curta", file: "fbas_05shrt_shortshirt_00a.png", shapedFile: "fbas_05shrt_shortshirtboobs_00a.png" },
            { code: "longshirt", label: "Camisa longa", file: "fbas_05shrt_longshirt_00a.png", shapedFile: "fbas_05shrt_longshirtboobs_00a.png" },
            { code: "tanktop", label: "Regata", file: "fbas_05shrt_tanktop_00a.png", shapedFile: "fbas_05shrt_tanktopboobs_00a.png" },
            { code: "bra", label: "Top", file: "fbas_05shrt_bra_00a.png" },
        ],
    },
    {
        slot: "overalls",
        label: "Macacão",
        dir: "06lwr2-overalls",
        order: 6,
        icon: "overalls",
        items: [
            { code: "overalls", label: "Macacão longo", file: "fbas_06lwr2_overalls_00a.png", shapedFile: "fbas_06lwr2_overallsboobs_00a.png" },
            { code: "shortalls", label: "Jardineira curta", file: "fbas_06lwr2_shortalls_00a.png", shapedFile: "fbas_06lwr2_shortallsboobs_00a.png" },
        ],
    },
    {
        slot: "boots",
        label: "Botas",
        dir: "07fot2-boots-over-pants",
        order: 7,
        icon: "boot",
        items: [
            { code: "cuffedboots", label: "Botas de cano dobrado", file: "fbas_07fot2_cuffedboots_00a.png" },
            { code: "curlytoeshoes", label: "Sapatos de bico curvo", file: "fbas_07fot2_curlytoeshoes_00a.png" },
        ],
    },
    {
        slot: "skirt",
        label: "Saia / vestido",
        dir: "08lwr3-skirts-dresses",
        order: 8,
        icon: "dress",
        items: [
            { code: "longskirt", label: "Saia longa", file: "fbas_08lwr3_longskirt_00a.png" },
            { code: "frillyskirt", label: "Saia de babados", file: "fbas_08lwr3_frillyskirt_00a.png" },
            { code: "longdress", label: "Vestido longo", file: "fbas_08lwr3_longdress_00a.png", shapedFile: "fbas_08lwr3_longdressboobs_00a.png" },
            { code: "frillydress", label: "Vestido de babados", file: "fbas_08lwr3_frillydress_00a.png", shapedFile: "fbas_08lwr3_frillydressboobs_00a.png" },
        ],
    },
    {
        slot: "hands",
        label: "Luvas",
        dir: "09hand-handwear",
        order: 9,
        icon: "glove",
        items: [{ code: "gloves", label: "Luvas", file: "fbas_09hand_gloves_00a.png" }],
    },
    {
        slot: "outer",
        label: "Sobretudo",
        dir: "10outr-outerwear",
        order: 10,
        icon: "vest",
        items: [
            { code: "vest", label: "Colete", file: "fbas_10outr_vest_00a.png" },
            { code: "suspenders", label: "Suspensórios", file: "fbas_10outr_suspenders_00a.png" },
        ],
    },
    {
        slot: "neck",
        label: "Capa / pescoço",
        dir: "11neck-neckwear",
        order: 11,
        icon: "cloak",
        items: [
            { code: "scarf", label: "Cachecol", file: "fbas_11neck_scarf_00b.png" },
            { code: "mantleplain", label: "Manto", file: "fbas_11neck_mantleplain_00b.png" },
            { code: "cloakplain", label: "Capa", file: "fbas_11neck_cloakplain_00d.png", under: "fbas_00undr_cloakplain_00d.png" },
            { code: "cloakwithmantleplain", label: "Capa com manto", file: "fbas_11neck_cloakwithmantleplain_00b.png", under: "fbas_00undr_cloakwithmantleplain_00b.png" },
        ],
    },
    {
        slot: "face",
        label: "Óculos",
        dir: "12face-facewear",
        order: 12,
        icon: "glasses",
        items: [
            { code: "glasses", label: "Óculos", file: "fbas_12face_glasses_00a.png" },
            { code: "shades", label: "Óculos escuros", file: "fbas_12face_shades_00a.png" },
        ],
    },
    {
        slot: "hair",
        label: "Cabelo",
        dir: "13hair-hair",
        order: 13,
        icon: "hair",
        items: [
            { code: "dapper", label: "Elegante", file: "fbas_13hair_dapper_00.png" },
            { code: "bob1", label: "Chanel I", file: "fbas_13hair_bob1_00.png" },
            { code: "bob2", label: "Chanel II", file: "fbas_13hair_bob2_00.png" },
            { code: "afro", label: "Afro", file: "fbas_13hair_afro_00.png" },
            { code: "afropuffs", label: "Puffs afro", file: "fbas_13hair_afropuffs_00.png" },
            { code: "twists", label: "Twists", file: "fbas_13hair_twists_00.png" },
            { code: "bushy", label: "Volumoso", file: "fbas_13hair_bushy_00.png" },
            { code: "flattop", label: "Topete reto", file: "fbas_13hair_flattop_00.png" },
            { code: "spiky1", label: "Espetado I", file: "fbas_13hair_spiky1_00.png" },
            { code: "spiky2", label: "Espetado II", file: "fbas_13hair_spiky2_00.png" },
            { code: "mohawk", label: "Moicano", file: "fbas_13hair_mohawk_00_e.png", hiddenByHats: true },
            { code: "ponytail1", label: "Rabo de cavalo", file: "fbas_13hair_ponytail1_00.png" },
            { code: "twintail", label: "Maria-chiquinha", file: "fbas_13hair_twintail_00.png" },
            { code: "topknot", label: "Coque alto", file: "fbas_13hair_topknot_00f.png" },
            { code: "longbound", label: "Longo preso", file: "fbas_13hair_longbound_00.png" },
            { code: "longboundclasped", label: "Longo com presilha", file: "fbas_13hair_longboundclasped_00f.png" },
            { code: "longwavy", label: "Longo ondulado", file: "fbas_13hair_longwavy_00.png" },
        ],
    },
    {
        slot: "headwear",
        label: "Chapéu",
        dir: "14head-headwear",
        order: 14,
        icon: "hat",
        items: [
            { code: "strawhat", label: "Chapéu de palha", file: "fbas_14head_strawhat_00d.png" },
            { code: "strawhat01", label: "Chapéu de palha II", file: "fbas_14head_strawhat_01.png" },
            { code: "cowboyhat", label: "Chapéu de cowboy", file: "fbas_14head_cowboyhat_00d.png" },
            { code: "cowboyhat01", label: "Chapéu de cowboy II", file: "fbas_14head_cowboyhat_01.png" },
            { code: "boaterhat", label: "Chapéu palheta", file: "fbas_14head_boaterhat_00d.png" },
            { code: "boaterhat01", label: "Chapéu palheta II", file: "fbas_14head_boaterhat_01.png" },
            { code: "floppyhat", label: "Chapéu de abas largas", file: "fbas_14head_floppyhat_00d.png" },
            { code: "floppyhat01", label: "Chapéu de abas largas II", file: "fbas_14head_floppyhat_01.png" },
            { code: "bandana", label: "Bandana", file: "fbas_14head_bandana_00b_e.png", hidesHair: true },
            { code: "headscarf", label: "Lenço de cabeça", file: "fbas_14head_headscarf_00b_e.png", hidesHair: true },
            { code: "mushroom1", label: "Cogumelo I", file: "fbas_14head_mushroom1_00d.png" },
            { code: "mushroom101", label: "Cogumelo II", file: "fbas_14head_mushroom1_01.png" },
            { code: "mushroom102", label: "Cogumelo III", file: "fbas_14head_mushroom1_02.png" },
            { code: "mushroom103", label: "Cogumelo IV", file: "fbas_14head_mushroom1_03.png" },
            { code: "mushroom104", label: "Cogumelo V", file: "fbas_14head_mushroom1_04.png" },
            { code: "mushroom105", label: "Cogumelo VI", file: "fbas_14head_mushroom1_05.png" },
        ],
    },
];

/**
 * Cell indexes read off `guides/farmer base animation guide.png`.
 * `flip` marks the frames the guide draws mirrored; side sheets are drawn facing right.
 */
export const MANA_SEED_POSES: Record<ManaSeedPose, { label: string; frameDuration: number; down: ManaSeedFrame[]; up: ManaSeedFrame[]; side: ManaSeedFrame[] }> = {
    idle: {
        label: "Parado",
        frameDuration: 0,
        down: [{ index: 0 }],
        up: [{ index: 16 }],
        side: [{ index: 32 }],
    },
    walk: {
        label: "Andando",
        frameDuration: 135,
        down: [{ index: 48 }, { index: 49 }, { index: 50 }, { index: 48, flip: true }, { index: 49, flip: true }, { index: 50, flip: true }],
        up: [{ index: 52 }, { index: 53 }, { index: 54 }, { index: 52, flip: true }, { index: 53, flip: true }, { index: 54, flip: true }],
        side: [{ index: 64 }, { index: 65 }, { index: 66 }, { index: 67 }, { index: 68 }, { index: 69 }],
    },
};

export function getManaSeedAnimation(pose: ManaSeedPose, direction: ManaSeedDirection) {
    const entry = MANA_SEED_POSES[pose];
    const frames = direction === "down" ? entry.down : direction === "up" ? entry.up : entry.side;
    return { frames, frameDuration: entry.frameDuration, mirrored: direction === "left" };
}

export const EMPTY_MANA_SEED_APPEARANCE: ManaSeedAppearance = { hair: null, headwear: null, face: null, shirt: null, pants: null, overalls: null, skirt: null, outer: null, socks: null, shoes: null, boots: null, hands: null, neck: null };

export function createManaSeedAppearance(partial: Partial<ManaSeedAppearance>): ManaSeedAppearance {
    return { ...EMPTY_MANA_SEED_APPEARANCE, ...partial };
}

export const DEFAULT_MANA_SEED_APPEARANCE = createManaSeedAppearance({ hair: "dapper", shirt: "shortshirt", pants: "longpants", shoes: "shoes" });

/** Ramp index per slot. Indexes are looked up in the table the equipped sheet declares. */
export const DEFAULT_MANA_SEED_COLORS: ManaSeedColors = { skin: 0, hair: 37, headwear: 30, face: 2, shirt: 6, pants: 5, overalls: 5, skirt: 22, outer: 32, socks: 0, shoes: 32, boots: 32, hands: 32, neck: 38 };

export function createManaSeedColors(partial: Partial<ManaSeedColors>): ManaSeedColors {
    return { ...DEFAULT_MANA_SEED_COLORS, ...partial };
}
