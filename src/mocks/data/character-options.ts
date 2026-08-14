import { createManaSeedAppearance, createManaSeedColors } from "@/mocks/data/mana-seed";
import type { CharacterAura, CharacterPreset } from "@/types/character";

export const CHARACTER_PRESETS: CharacterPreset[] = [
    {
        id: "farmer",
        label: "Fazendeiro",
        helper: "Traje da colheita",
        icon: "overalls",
        appearance: createManaSeedAppearance({ hair: "dapper", headwear: "strawhat", shirt: "shortshirt", overalls: "overalls", shoes: "boots", hands: "gloves" }),
        colors: createManaSeedColors({ skin: 5, hair: 36, headwear: 30, shirt: 24, overalls: 5, shoes: 32, hands: 32 }),
    },
    {
        id: "villager",
        label: "Aldeão",
        helper: "Roupa para a vila",
        icon: "shirt",
        appearance: createManaSeedAppearance({ hair: "bob1", shirt: "longshirt", pants: "longpants", socks: "sockslow", shoes: "shoes" }),
        colors: createManaSeedColors({ skin: 1, hair: 33, shirt: 6, pants: 32, socks: 0, shoes: 33 }),
    },
    {
        id: "traveler",
        label: "Viajante",
        helper: "Estrada e capa",
        icon: "cloak",
        appearance: createManaSeedAppearance({ hair: "longbound", neck: "cloakplain", shirt: "tanktop", pants: "shorts", boots: "cuffedboots", hands: "gloves" }),
        colors: createManaSeedColors({ skin: 10, hair: 37, neck: 38, shirt: 20, pants: 31, boots: 32, hands: 33 }),
    },
    {
        id: "artisan",
        label: "Artesão",
        helper: "Pronto para criar",
        icon: "vest",
        appearance: createManaSeedAppearance({ hair: "spiky1", headwear: "bandana", shirt: "shortshirt", outer: "suspenders", pants: "longpants", shoes: "boots" }),
        colors: createManaSeedColors({ skin: 13, hair: 41, headwear: 41, shirt: 0, outer: 32, pants: 2, shoes: 33 }),
    },
    {
        id: "noble",
        label: "Nobre",
        helper: "Salão da guilda",
        icon: "dress",
        appearance: createManaSeedAppearance({ hair: "longwavy", headwear: "boaterhat", face: "glasses", skirt: "longdress", neck: "mantleplain", shoes: "shoes" }),
        colors: createManaSeedColors({ skin: 2, hair: 2, headwear: 2, face: 3, skirt: 44, neck: 52, shoes: 3 }),
    },
    {
        id: "herbalist",
        label: "Herbalista",
        helper: "Bosque e poções",
        icon: "hat",
        appearance: createManaSeedAppearance({ hair: "twintail", headwear: "mushroom1", shirt: "longshirt", skirt: "longskirt", socks: "stockings", boots: "curlytoeshoes" }),
        colors: createManaSeedColors({ skin: 4, hair: 18, headwear: 41, shirt: 24, skirt: 22, socks: 0, boots: 32 }),
    },
];

export const CHARACTER_AURAS: CharacterAura[] = [
    { name: "Druida", color: "var(--color-green)", image: "/images/sprites/classes/druida.png" },
    { name: "Bardo", color: "var(--color-orange)", image: "/images/sprites/classes/bardo.png" },
    { name: "Guerreiro", color: "var(--color-orange)", image: "/images/sprites/classes/guerreiro.png" },
    { name: "Clérigo", color: "var(--color-blue)", image: "/images/sprites/classes/clerigo.png" },
    { name: "Bruxo", color: "var(--color-purple)", image: "/images/sprites/classes/bruxo.png" },
    { name: "Necromante", color: "var(--color-black-muted)", image: "/images/sprites/classes/necromante.png" },
];
