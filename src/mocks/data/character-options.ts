import type { CharacterAura, CharacterPreset } from "@/types/character";

export const CHARACTER_PRESETS: CharacterPreset[] = [
    { id: "farmer", label: "Fazendeiro", helper: "Traje da colheita", icon: "shirt", appearance: { hair: "dapper", shirt: "short", headwear: "cowboyHat" } },
    { id: "villager", label: "Aldeão", helper: "Roupa para a vila", icon: "face", appearance: { hair: "bob", shirt: "shortBoobs", headwear: "none" } },
    { id: "traveler", label: "Viajante", helper: "Leve e prático", icon: "shoe", appearance: { hair: "dapper", shirt: "shortBoobs", headwear: "none" } },
    { id: "worker", label: "Artesão", helper: "Pronto para criar", icon: "pants", appearance: { hair: "bob", shirt: "short", headwear: "cowboyHat" } },
];

export const CHARACTER_AURAS: CharacterAura[] = [
    { name: "Druida", color: "var(--color-green)", image: "/images/sprites/classes/druida.png" },
    { name: "Bardo", color: "var(--color-orange)", image: "/images/sprites/classes/bardo.png" },
    { name: "Guerreiro", color: "var(--color-orange)", image: "/images/sprites/classes/guerreiro.png" },
    { name: "Clérigo", color: "var(--color-blue)", image: "/images/sprites/classes/clerigo.png" },
    { name: "Bruxo", color: "var(--color-purple)", image: "/images/sprites/classes/bruxo.png" },
    { name: "Necromante", color: "var(--color-black-muted)", image: "/images/sprites/classes/necromante.png" },
];
