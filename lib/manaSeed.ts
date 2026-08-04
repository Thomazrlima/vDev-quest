export const MANA_SEED_FREE = {
  source: "Mana Seed Farmer Sprite – Free Sample",
  grid: {
    columns: 16,
    rows: 16,
    frameWidth: 64,
    frameHeight: 64
  },
  baseLayers: [
    "/sprites/mana-seed-free/body.png",
    "/sprites/mana-seed-free/shoes.png",
    "/sprites/mana-seed-free/longpants.png"
  ],
  hairstyles: {
    dapper: { label: "Dapper", src: "/sprites/mana-seed-free/hair-dapper.png" },
    bob: { label: "Bob", src: "/sprites/mana-seed-free/hair-bob1.png" }
  },
  shirts: {
    short: { label: "Camisa curta", src: "/sprites/mana-seed-free/shortshirt.png" },
    shortBoobs: { label: "Camisa curta II", src: "/sprites/mana-seed-free/shortshirt-boobs.png" }
  },
  headwear: {
    none: { label: "Sem chapéu", src: null },
    cowboyHat: { label: "Chapéu cowboy", src: "/sprites/mana-seed-free/cowboyhat.png" }
  },
  animations: {
    // Free Sample: WALK, primeira direção exibida no guia de animação.
    podiumWalk: {
      frames: [48, 51, 49, 52, 50],
      frameDurationMs: 190
    }
  },
  // Primeiro frame da sequência de walk: postura frontal mais neutra disponível.
  staticAvatarFrame: 48
} as const;

export type ManaSeedAppearance = {
  hair: keyof typeof MANA_SEED_FREE.hairstyles;
  shirt: keyof typeof MANA_SEED_FREE.shirts;
  headwear: keyof typeof MANA_SEED_FREE.headwear;
};

export const DEFAULT_MANA_SEED_APPEARANCE: ManaSeedAppearance = {
  hair: "dapper",
  shirt: "short",
  headwear: "none"
};

export function manaSeedLayersFor(appearance: ManaSeedAppearance = DEFAULT_MANA_SEED_APPEARANCE) {
  const headwear = MANA_SEED_FREE.headwear[appearance.headwear].src;

  return [
    ...MANA_SEED_FREE.baseLayers,
    MANA_SEED_FREE.shirts[appearance.shirt].src,
    MANA_SEED_FREE.hairstyles[appearance.hair].src,
    ...(headwear ? [headwear] : [])
  ];
}

export function manaSeedFramePosition(frame: number) {
  const { columns, rows } = MANA_SEED_FREE.grid;
  const column = frame % columns;
  const row = Math.floor(frame / columns);

  return {
    backgroundSize: `${columns * 100}% ${rows * 100}%`,
    // Com uma imagem maior que o container, porcentagens positivas deslocam
    // a folha para cima/esquerda até a célula solicitada.
    backgroundPosition: `${(column / (columns - 1)) * 100}% ${(row / (rows - 1)) * 100}%`
  };
}
