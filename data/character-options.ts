import type { CharacterAura, CharacterPreset } from "@/types/character";

export const CHARACTER_PRESETS: CharacterPreset[] = [
  { id: "farmer", label: "Fazendeiro", helper: "Traje da colheita", icon: "shirt", appearance: { hair: "dapper", shirt: "short", headwear: "cowboyHat" } },
  { id: "villager", label: "Aldeão", helper: "Roupa para a vila", icon: "face", appearance: { hair: "bob", shirt: "shortBoobs", headwear: "none" } },
  { id: "traveler", label: "Viajante", helper: "Leve e prático", icon: "shoe", appearance: { hair: "dapper", shirt: "shortBoobs", headwear: "none" } },
  { id: "worker", label: "Artesão", helper: "Pronto para criar", icon: "pants", appearance: { hair: "bob", shirt: "short", headwear: "cowboyHat" } }
];

export const CHARACTER_AURAS: CharacterAura[] = [
  { name: "Druida", color: "#758b47", wash: "rgba(104,139,58,.72)" },
  { name: "Bardo", color: "#d2a343", wash: "rgba(210,163,67,.72)" },
  { name: "Guerreiro", color: "#bb6551", wash: "rgba(187,101,81,.7)" },
  { name: "Clérigo", color: "#4a9ba1", wash: "rgba(74,155,161,.7)" },
  { name: "Buxro", color: "#8875b8", wash: "rgba(136,117,184,.68)" },
  { name: "Necromante", color: "#8b8476", wash: "rgba(139,132,118,.66)" }
];
