import type { CSSProperties } from "react";
import { ManaSeedSpriteLayers } from "@/components/molecules/ManaSeedSpriteLayers";
import { MANA_SEED_FREE } from "@/data/mana-seed";
import type { BodyType, CharacterAura } from "@/types/character";

export function CharacterPreview({ name, aura, bodyType, layers }: { name: string; aura: CharacterAura; bodyType: BodyType; layers: readonly string[] }) {
  return <section className="creator-stage" aria-label="Pré-visualização do personagem"><div className="creator-arcane-aura" style={{ "--aura-wash": aura.wash } as CSSProperties} /><div className="creator-rune-circle"><span>ᚠ</span><span>ᚢ</span><span>ᚦ</span><span>ᚨ</span></div><div role="img" aria-label={`Prévia de ${name || "novo herói"}`} className="mana-seed-sprite creator-full-sprite"><ManaSeedSpriteLayers frame={MANA_SEED_FREE.staticAvatarFrame} layers={layers} /></div><div className="creator-stone-pedestal"><div className="creator-pedestal-runes">ᚠ&nbsp;&nbsp;ᚢ&nbsp;&nbsp;ᚦ&nbsp;&nbsp;ᚨ&nbsp;&nbsp;ᚱ&nbsp;&nbsp;ᚲ&nbsp;&nbsp;ᚷ</div><strong className="creator-pedestal-plaque">{name || "HERÓI SEM NOME"}</strong></div><p className="creator-stage-caption"><span style={{ backgroundColor: aura.color }} /> Classe: {aura.name} <b>·</b> {bodyType === "hero" ? "Herói" : "Heroína"}</p></section>;
}
