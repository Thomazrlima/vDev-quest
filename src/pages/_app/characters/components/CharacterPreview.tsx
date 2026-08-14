import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "pixelarticons/react";
import { ManaSeedSpriteLayers } from "@/components/ManaSeed/ManaSeedSpriteLayers";
import { Button } from "@/components/ui/Button";
import { getManaSeedAnimation, MANA_SEED_POSES } from "@/mocks/data/mana-seed";
import type { ManaSeedDirection, ManaSeedLayer, ManaSeedPose } from "@/types/character";

const DIRECTIONS: { value: ManaSeedDirection; icon: typeof ArrowDown; label: string }[] = [
    { value: "down", icon: ArrowDown, label: "De frente" },
    { value: "up", icon: ArrowUp, label: "De costas" },
    { value: "left", icon: ArrowLeft, label: "Perfil esquerdo" },
    { value: "right", icon: ArrowRight, label: "Perfil direito" },
];

const POSES = Object.keys(MANA_SEED_POSES) as ManaSeedPose[];

export function CharacterPreview({ name, layers }: { name: string; layers: readonly ManaSeedLayer[] }) {
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
        <section className="relative flex min-h-[690px] flex-col items-center justify-end overflow-hidden border-[5px] border-[var(--color-primary-dark)] bg-[radial-gradient(circle_at_50%_42%,var(--color-black-soft),var(--color-black-soft)_68%)] p-0 shadow-[0_0_0_3px_var(--color-primary-dark),7px_8px_0_var(--color-black-overlay),inset_0_0_0_2px_var(--color-primary-overlay)] max-xl:min-h-[570px]" aria-label="Pré-visualização do personagem">
            <div className="absolute inset-x-0 top-0 z-[6] flex flex-wrap items-center justify-between gap-2 border-b-2 border-[var(--color-primary-dark)] bg-[var(--color-black-overlay)] p-2">
                <div className="flex gap-1" role="group" aria-label="Direção do sprite">
                    {DIRECTIONS.map((option) => (
                        <Button key={option.value} type="button" onClick={() => setDirection(option.value)} aria-pressed={direction === option.value} aria-label={option.label} title={option.label} className={`h-7 w-7 border-2 p-0 text-[.8rem] leading-none shadow-[2px_2px_0_var(--color-black)] ${direction === option.value ? "border-primary bg-primary text-[var(--color-black)]" : "border-[var(--color-primary-dark)] bg-[var(--color-black)] text-primary"}`}>
                            <option.icon className="h-4 w-4" />
                        </Button>
                    ))}
                </div>
                <div className="flex gap-1" role="group" aria-label="Animação do sprite">
                    {POSES.map((option) => (
                        <Button key={option} type="button" onClick={() => setPose(option)} aria-pressed={pose === option} className={`h-7 border-2 px-2 py-0 text-[.5rem] tracking-[.12em] shadow-[2px_2px_0_var(--color-black)] ${pose === option ? "border-primary bg-primary text-[var(--color-black)]" : "border-[var(--color-primary-dark)] bg-[var(--color-black)] text-primary"}`}>
                            {MANA_SEED_POSES[option].label.toUpperCase()}
                        </Button>
                    ))}
                </div>
            </div>
            <div role="img" aria-label={`Prévia de ${name || "novo herói"}`} className="relative z-[3] -mt-6 h-[min(122vw,620px)] w-[min(122%,620px)] overflow-visible [image-rendering:pixelated] [filter:drop-shadow(9px_10px_0_var(--color-black-overlay))]">
                <div className="absolute inset-0 origin-bottom [transform:translateY(10%)_scale(1.16)]">
                    {/*
                     `flip` é opcional no quadro, e `undefined !== false` é verdadeiro: sem o
                     `Boolean` o perfil direito também saía espelhado, e as duas setas laterais
                     mostravam o herói virado para o mesmo lado.
                    */}
                    <ManaSeedSpriteLayers frame={cell.index} flipped={Boolean(cell.flip) !== mirrored} layers={layers} />
                </div>
            </div>
        </section>
    );
}
