import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ManaSeedAvatar } from "@/components/ManaSeed/ManaSeedAvatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ExperienceProgress } from "@/components/ui/ExperienceProgress";
import { Heading } from "@/components/ui/Heading";
import { SparkIcon } from "@/components/icons";
import { renderTextWithNumericFont } from "@/lib/typography";
import { getManaSeedLayers } from "@/utils/mana-seed";
import { useStoredCharacter } from "@/utils/use-stored-character";

export function ProfileSummary() {
    // O retrato é o personagem montado na oficina, não o herói de exemplo das fichas.
    const character = useStoredCharacter();
    const layers = useMemo(() => getManaSeedLayers(character.appearance, character.bodyType, character.colors), [character]);

    return (
        <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,var(--color-orange-overlay),transparent_36%)]" />
            <div className="relative grid gap-7 p-5 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:p-10">
                <div className="relative mx-auto lg:mx-0">
                    <div className="absolute -inset-3 border-2 border-dashed border-orange-dark" />
                    <ManaSeedAvatar size="xl" alt={`Avatar de ${character.name}`} layers={layers} className="relative border-4 shadow-pixel" />
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 border-2 border-orange-dark bg-(--color-primary-dark) px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-light shadow-[3px_3px_0_var(--color-black)]">Guerreiro</span>
                </div>
                <div className="text-center lg:text-left">
                    <Eyebrow className="mb-2">Perfil do aventureiro</Eyebrow>
                    <h1 className="text-3xl font-black tracking-tight text-primary-light sm:text-4xl">Rafael Tomaz</h1>
                    <p className="mt-1 text-xs font-bold text-(--color-black-muted)">@RafaelDev · membro desde a Temporada I</p>
                    <p className="mt-5 max-w-lg text-sm leading-relaxed text-(--color-white-muted)">Complete missões, acumule cupons e acompanhe suas conquistas na guilda.</p>
                    <Button asChild className="mt-6 px-5 text-[10px]">
                        <Link to="/characters">
                            <SparkIcon className="h-4 w-4" /> Criar personagem
                        </Link>
                    </Button>
                </div>
                <div className="mx-auto w-full max-w-sm border-l-0 border-orange-dark lg:mx-0 lg:w-64 lg:border-l-2 lg:pl-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <Eyebrow>Cupons conquistados</Eyebrow>
                            <Heading as="strong" className="mt-1 block text-4xl">
                                {renderTextWithNumericFont(42)}
                            </Heading>
                        </div>
                        <span className="mb-1 text-[10px] font-bold text-(--color-black-muted)">{renderTextWithNumericFont("42 cupons")}</span>
                    </div>
                    <ExperienceProgress progress={72} showLevel={false} showXp={false} progressClassName="mt-3 h-4 border-orange-dark p-0.5" />
                    <p className="mt-2 text-right text-[10px] text-(--color-black-muted)">{renderTextWithNumericFont("8 cupons para a próxima recompensa")}</p>
                </div>
            </div>
        </Card>
    );
}
