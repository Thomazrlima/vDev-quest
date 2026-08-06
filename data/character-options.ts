import type { CharacterAura, CharacterPreset } from "@/types/character";

export const CHARACTER_PRESETS: CharacterPreset[] = [
  { id: "farmer", label: "Fazendeiro", helper: "Traje da colheita", icon: "shirt", appearance: { hair: "dapper", shirt: "short", headwear: "cowboyHat" } },
  { id: "villager", label: "Aldeão", helper: "Roupa para a vila", icon: "face", appearance: { hair: "bob", shirt: "shortBoobs", headwear: "none" } },
  { id: "traveler", label: "Viajante", helper: "Leve e prático", icon: "shoe", appearance: { hair: "dapper", shirt: "shortBoobs", headwear: "none" } },
  { id: "worker", label: "Artesão", helper: "Pronto para criar", icon: "pants", appearance: { hair: "bob", shirt: "short", headwear: "cowboyHat" } }
];

export const CHARACTER_AURAS: CharacterAura[] = [
  { name: "Druida", color: "#758b47", image: "/art/classes/druida.png" },
  { name: "Bardo", color: "#d2a343", image: "/art/classes/bardo.png" },
  { name: "Guerreiro", color: "#bb6551", image: "/art/classes/guerreiro.png" },
  { name: "Clérigo", color: "#4a9ba1", image: "/art/classes/clerigo.png" },
  { name: "Bruxo", color: "#8875b8", image: "/art/classes/bruxo.png" },
  { name: "Necromante", color: "#8b8476", image: "/art/classes/necromante.png" }
];
