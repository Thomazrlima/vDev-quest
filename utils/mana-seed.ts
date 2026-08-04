import { DEFAULT_MANA_SEED_APPEARANCE, MANA_SEED_FREE } from "@/data/mana-seed";
import type { ManaSeedAppearance } from "@/types/character";

export function getManaSeedLayers(appearance: ManaSeedAppearance = DEFAULT_MANA_SEED_APPEARANCE) {
  const headwear = MANA_SEED_FREE.headwear[appearance.headwear].src;
  return [...MANA_SEED_FREE.baseLayers, MANA_SEED_FREE.shirts[appearance.shirt].src, MANA_SEED_FREE.hairstyles[appearance.hair].src, ...(headwear ? [headwear] : [])];
}

export function getManaSeedFramePosition(frame: number) {
  const { columns, rows } = MANA_SEED_FREE.grid;
  const column = frame % columns;
  const row = Math.floor(frame / columns);
  return { backgroundSize: `${columns * 100}% ${rows * 100}%`, backgroundPosition: `${(column / (columns - 1)) * 100}% ${(row / (rows - 1)) * 100}%` };
}
