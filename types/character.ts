export type ManaSeedAppearance = {
  hair: "dapper" | "bob";
  shirt: "short" | "shortBoobs";
  headwear: "none" | "cowboyHat";
};

export type BodyType = "hero" | "heroine";
export type CharacterAura = { name: string; color: string; wash: string };
export type CharacterPreset = { id: string; label: string; helper: string; icon: "shirt" | "face" | "shoe" | "pants"; appearance: ManaSeedAppearance };
