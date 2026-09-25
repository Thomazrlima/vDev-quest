import { useMemo } from "react";
import { Sparkle } from "pixelarticons/react";
import { Link } from "@tanstack/react-router";
import { ManaSeedAvatar } from "@/components/ManaSeed/ManaSeedAvatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ExperienceProgress } from "@/components/ui/ExperienceProgress";
import { Heading } from "@/components/ui/Heading";
import { HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import { getManaSeedLayers } from "@/utils/mana-seed";
import { useStoredCharacter } from "@/utils/use-stored-character";
import type { Profile } from "@/api/types";

export function ProfileSummary({ profile }: { profile?: Profile }) {
    // O retrato é o personagem montado na oficina, não o herói de exemplo das fichas.
    const character = useStoredCharacter();
    const layers = useMemo(() => getManaSeedLayers(character.appearance, character.bodyType, character.colors), [character.appearance, character.bodyType, character.colors]);

    return (
        <Card className={cn("relative overflow-hidden", HALL_PANEL)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,var(--color-primary-overlay),transparent_42%)]" />
            <div className="relative grid gap-7 p-5 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:p-10">
                <div className="relative mx-auto lg:mx-0">
                    <div className="absolute -inset-3 border border-primary-dark" />
                    <ManaSeedAvatar size="xl" alt={`Avatar de ${profile?.name ?? character.name}`} layers={layers} className="relative border-2 border-primary shadow-[0_8px_18px_rgb(0_0_0/30%)]" />
                </div>
                <div className="text-center lg:text-left">
                    <Eyebrow className="mb-2">Perfil do aventureiro</Eyebrow>
                    <Heading className="text-3xl sm:text-4xl">{profile?.name ?? "Aventureiro"}</Heading>
                    <p className="mt-1 text-[.65rem] font-black uppercase tracking-[.08em] text-primary">{profile?.activeTitle ?? profile?.levelLabel ?? "Aventureiro"} · Nível {profile?.level ?? 1}</p>
                    <p className="mt-5 max-w-lg text-sm leading-relaxed text-white-muted">Complete missões, acumule EXP e acompanhe suas conquistas na guilda.</p>
                    <Button asChild className="mt-6 px-5 text-[10px] shadow-[4px_4px_0_var(--color-primary-dark)]">
                        <Link to="/characters">
                            <Sparkle className="h-4 w-4" /> Criar personagem
                        </Link>
                    </Button>
                </div>
                <div className="mx-auto w-full max-w-sm border-l-0 border-primary-dark lg:mx-0 lg:w-64 lg:border-l-2 lg:pl-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <Eyebrow>EXP acumulada</Eyebrow>
                            <Heading as="strong" className="mt-1 block text-4xl">
                                {renderTextWithNumericFont(new Intl.NumberFormat("pt-BR").format(profile?.xp ?? 0))}
                            </Heading>
                        </div>
                        <span className="mb-1 text-[10px] font-black uppercase tracking-[.08em] text-primary-light">{renderTextWithNumericFont(`Nível ${profile?.level ?? 1}`)}</span>
                    </div>
                    <ExperienceProgress progress={profile?.progress ?? 100} showLevel={false} showXp={false} progressClassName="mt-3 h-4 border-primary-dark p-0.5" />
                    <p className="mt-2 text-right text-[10px] font-black uppercase tracking-[.08em] text-primary-light">{renderTextWithNumericFont(profile?.nextLevelXp ? `${profile.nextLevelXp - profile.xp} EXP para o próximo nível` : "Nível máximo cadastrado")}</p>
                </div>
            </div>
        </Card>
    );
}
