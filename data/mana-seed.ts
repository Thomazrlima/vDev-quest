import type { ManaSeedAppearance } from "@/types/character";

export const MANA_SEED_FREE = {
  grid: { columns: 16, rows: 16, frameWidth: 64, frameHeight: 64 },
  baseLayers: ["/sprites/mana-seed-free/body.png", "/sprites/mana-seed-free/shoes.png", "/sprites/mana-seed-free/longpants.png"],
  hairstyles: { dapper: { label: "Dapper", src: "/sprites/mana-seed-free/hair-dapper.png" }, bob: { label: "Bob", src: "/sprites/mana-seed-free/hair-bob1.png" } },
  shirts: { short: { label: "Camisa curta", src: "/sprites/mana-seed-free/shortshirt.png" }, shortBoobs: { label: "Camisa curta II", src: "/sprites/mana-seed-free/shortshirt-boobs.png" } },
  headwear: { none: { label: "Sem chapéu", src: null }, cowboyHat: { label: "Chapéu cowboy", src: "/sprites/mana-seed-free/cowboyhat.png" } },
  staticAvatarFrame: 0
} as const;

export const DEFAULT_MANA_SEED_APPEARANCE: ManaSeedAppearance = { hair: "dapper", shirt: "short", headwear: "none" };
