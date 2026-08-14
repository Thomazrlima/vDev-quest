import { ManaSeedSpriteLayers } from "@/components/ManaSeed/ManaSeedSpriteLayers";
import { MANA_SEED_FREE } from "@/mocks/data/mana-seed";
import type { BodyType, CharacterAura } from "@/types/character";

export function CharacterPreview({ name, aura, bodyType, layers }: { name: string; aura: CharacterAura; bodyType: BodyType; layers: readonly string[] }) {
    return (
        <section className="relative flex min-h-[690px] flex-col items-center justify-end overflow-hidden border-[5px] border-[var(--color-orange-dark)] bg-[radial-gradient(circle_at_50%_42%,var(--color-black-soft),var(--color-black-soft)_68%)] p-0 shadow-[0_0_0_3px_var(--color-orange-dark),7px_8px_0_var(--color-black-overlay),inset_0_0_0_2px_var(--color-orange-overlay)] max-xl:min-h-[570px]" aria-label="Pré-visualização do personagem">
            <div role="img" aria-label={`Prévia de ${name || "novo herói"}`} className="relative z-[3] -mt-6 h-[min(122vw,620px)] w-[min(122%,620px)] overflow-visible [image-rendering:pixelated] [filter:drop-shadow(9px_10px_0_var(--color-black-overlay))] [&>span]:[transform:translateY(10%)_scale(1.16)] [&>span]:[transform-origin:center_bottom]">
                <ManaSeedSpriteLayers frame={MANA_SEED_FREE.staticAvatarFrame} layers={layers} />
            </div>
            <div className="relative z-[4] -mt-[4.5rem] w-[min(86%,440px)] border-[5px] border-[var(--color-orange)] bg-[linear-gradient(var(--color-primary),var(--color-white-soft)_48%,var(--color-black-soft))] p-[.65rem_.75rem_.8rem] text-center shadow-[inset_3px_3px_0_var(--color-primary-light),inset_-3px_-3px_0_var(--color-black-soft),5px_6px_0_var(--color-black-overlay)]">
                <strong className="inline-block border-2 border-[var(--color-black-soft)] bg-[var(--color-orange)] px-[.8rem] py-[.24rem] text-[.58rem] font-black uppercase tracking-[.16em] text-[var(--color-orange-dark)]">{name || "HERÓI SEM NOME"}</strong>
            </div>
            <p className="relative z-[5] my-4 text-[.58rem] font-black uppercase tracking-[.1em] text-[var(--color-orange)]">
                <span className="mr-[.35rem] inline-block h-[.65rem] w-[.65rem] align-[-1px] border border-[var(--color-orange-dark)]" style={{ backgroundColor: aura.color }} /> Classe: {aura.name} <b className="mx-[.4rem]">·</b> {bodyType === "hero" ? "Herói" : "Heroína"}
            </p>
        </section>
    );
}
