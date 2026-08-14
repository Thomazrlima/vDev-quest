import { useEffect, useState } from "react";
import { ManaSeedSpriteLayers } from "@/components/ManaSeed/ManaSeedSpriteLayers";
import { Button } from "@/components/ui/Button";
import { renderTextWithNumericFont } from "@/lib/typography";
import { getManaSeedAnimation, MANA_SEED_POSES } from "@/mocks/data/mana-seed";
import type { BodyType, CharacterAura, ManaSeedDirection, ManaSeedLayer, ManaSeedPose } from "@/types/character";

const DIRECTIONS: { value: ManaSeedDirection; glyph: string; label: string }[] = [
    { value: "down", glyph: "↓", label: "De frente" },
    { value: "up", glyph: "↑", label: "De costas" },
    { value: "left", glyph: "←", label: "Perfil esquerdo" },
    { value: "right", glyph: "→", label: "Perfil direito" },
];

const POSES = Object.keys(MANA_SEED_POSES) as ManaSeedPose[];

export function CharacterPreview({ name, aura, bodyType, layers }: { name: string; aura: CharacterAura; bodyType: BodyType; layers: readonly ManaSeedLayer[] }) {
    const [pose, setPose] = useState<ManaSeedPose>("idle");
    const [direction, setDirection] = useState<ManaSeedDirection>("down");
    const [step, setStep] = useState(0);
    const { frames, frameDuration, mirrored } = getManaSeedAnimation(pose, direction);
    const cell = frames[step % frames.length];

    useEffect(() => {
        if (frameDuration === 0 || frames.length < 2) return;
        const timer = window.setInterval(() => setStep((current) => current + 1), frameDuration);
        return () => window.clearInterval(timer);
    }, [frameDuration, frames.length]);

    return (
        <section className="relative flex min-h-[690px] flex-col items-center justify-end overflow-hidden border-[5px] border-[var(--color-orange-dark)] bg-[radial-gradient(circle_at_50%_42%,var(--color-black-soft),var(--color-black-soft)_68%)] p-0 shadow-[0_0_0_3px_var(--color-orange-dark),7px_8px_0_var(--color-black-overlay),inset_0_0_0_2px_var(--color-orange-overlay)] max-xl:min-h-[570px]" aria-label="Pré-visualização do personagem">
            <div className="absolute inset-x-0 top-0 z-[6] flex flex-wrap items-center justify-between gap-2 border-b-2 border-[var(--color-orange-dark)] bg-[var(--color-black-overlay)] p-2">
                <div className="flex gap-1" role="group" aria-label="Direção do sprite">
                    {DIRECTIONS.map((option) => (
                        <Button key={option.value} type="button" onClick={() => setDirection(option.value)} aria-pressed={direction === option.value} aria-label={option.label} title={option.label} className={`h-7 w-7 border-2 p-0 text-[.8rem] leading-none shadow-[2px_2px_0_var(--color-black)] ${direction === option.value ? "border-primary bg-[var(--color-orange-dark)] text-primary-light" : "border-[var(--color-orange-dark)] bg-[var(--color-black)] text-[var(--color-orange)]"}`}>
                            {option.glyph}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-1" role="group" aria-label="Animação do sprite">
                    {POSES.map((option) => (
                        <Button key={option} type="button" onClick={() => setPose(option)} aria-pressed={pose === option} className={`h-7 border-2 px-2 py-0 text-[.5rem] tracking-[.12em] shadow-[2px_2px_0_var(--color-black)] ${pose === option ? "border-primary bg-[var(--color-orange-dark)] text-primary-light" : "border-[var(--color-orange-dark)] bg-[var(--color-black)] text-[var(--color-orange)]"}`}>
                            {MANA_SEED_POSES[option].label.toUpperCase()}
                        </Button>
                    ))}
                </div>
            </div>
            <div role="img" aria-label={`Prévia de ${name || "novo herói"}`} className="relative z-[3] -mt-6 h-[min(122vw,620px)] w-[min(122%,620px)] overflow-visible [image-rendering:pixelated] [filter:drop-shadow(9px_10px_0_var(--color-black-overlay))]">
                <div className="absolute inset-0 origin-bottom [transform:translateY(10%)_scale(1.16)]">
                    <ManaSeedSpriteLayers frame={cell.index} flipped={cell.flip !== mirrored} layers={layers} />
                </div>
            </div>
            <div className="relative z-[4] -mt-[4.5rem] w-[min(86%,440px)] border-[5px] border-[var(--color-orange)] bg-[linear-gradient(var(--color-primary),var(--color-white-soft)_48%,var(--color-black-soft))] p-[.65rem_.75rem_.8rem] text-center shadow-[inset_3px_3px_0_var(--color-primary-light),inset_-3px_-3px_0_var(--color-black-soft),5px_6px_0_var(--color-black-overlay)]">
                <strong className="inline-block border-2 border-[var(--color-black-soft)] bg-[var(--color-orange)] px-[.8rem] py-[.24rem] text-[.58rem] font-black uppercase tracking-[.16em] text-[var(--color-orange-dark)]">{renderTextWithNumericFont(name || "HERÓI SEM NOME")}</strong>
            </div>
            <p className="relative z-[5] my-4 text-[.58rem] font-black uppercase tracking-[.1em] text-[var(--color-orange)]">
                <span className="mr-[.35rem] inline-block h-[.65rem] w-[.65rem] align-[-1px] border border-[var(--color-orange-dark)]" style={{ backgroundColor: aura.color }} /> Classe: {aura.name} <b className="mx-[.4rem]">·</b> {bodyType === "hero" ? "Herói" : "Heroína"}
            </p>
        </section>
    );
}
