import { useMemo } from "react";
import { ManaSeedAvatar } from "@/components/ManaSeed/ManaSeedAvatar";
import { Card } from "@/components/ui/Card";
import { ExperienceProgress } from "@/components/ui/ExperienceProgress";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import { RankingBadge } from "./RankingBadge";
import type { RankingEntry } from "@/types/ranking";
import { getManaSeedLayers } from "@/utils/mana-seed";

const podiumBorderColor = {
    1: "border-primary",
    2: "border-white-soft",
    3: "border-[#cd7f32]",
} as const;

export function RankingTable({ entries }: { entries: RankingEntry[] }) {
    const rowClass = "relative grid min-h-[82px] grid-cols-[72px_minmax(280px,1.45fr)_minmax(260px,.9fr)] items-center gap-3.5 border-b px-6 transition odd:bg-black-soft even:bg-black-muted hover:bg-primary-overlay last:border-b-0 max-[760px]:min-h-0 max-[760px]:grid-cols-[38px_minmax(0,1fr)] max-[760px]:grid-rows-[auto_auto] max-[760px]:gap-x-3 max-[760px]:gap-y-2.5 max-[760px]:px-3 max-[760px]:py-3.5";
    return (
        <Card as="section" className="mx-auto w-[min(1180px,100%)] overflow-hidden border-4 border-primary bg-black-overlay" aria-labelledby="ranking-table-title">
            <div className="overflow-x-auto max-[760px]:overflow-visible">
                <div className="min-w-175 max-[760px]:min-w-0">
                    <div className="grid min-h-11.5 grid-cols-[72px_minmax(280px,1.45fr)_minmax(260px,.9fr)] items-center gap-3.5 border-b-2 border-primary-dark bg-black px-6 text-[.7rem] font-black uppercase tracking-[.15em] text-primary-light max-[760px]:hidden" role="row">
                        <span>Pos.</span>
                        <span>Aventureiro</span>
                        <span>Nível / EXP</span>
                    </div>
                    <div className="hidden min-h-10 grid-cols-[38px_minmax(0,1fr)] items-center gap-3 border-b-2 border-primary-dark bg-black px-3 text-[.55rem] font-black uppercase tracking-[.15em] text-primary-light max-[760px]:grid" role="row">
                        <span>Pos.</span>
                        <div className="flex items-center justify-between gap-3">
                            <span>Aventureiro</span>
                            <span>Nível</span>
                        </div>
                    </div>
                    {entries.map((person) => {
                        const borderColor = podiumBorderColor[person.position as keyof typeof podiumBorderColor] ?? "border-primary-dark";

                        return (
                            <article className={cn(rowClass, borderColor)} key={person.position}>
                                <strong className={cn("text-center text-2xl text-primary-light max-[760px]:col-start-1 max-[760px]:row-span-2 max-[760px]:row-start-1 max-[760px]:grid max-[760px]:place-items-center max-[760px]:border-r max-[760px]:text-lg", borderColor)}>{renderTextWithNumericFont(String(person.position).padStart(2, "0"))}</strong>
                                <div className="flex min-w-0 items-center gap-3.75 max-[760px]:col-start-2 max-[760px]:gap-2.5">
                                    <ManaSeedAvatar size="md" alt={`Retrato de ${person.name}`} layers={getManaSeedLayers(person.appearance)} className={cn("bg-black max-[760px]:h-11.5 max-[760px]:w-11.5 max-[760px]:border-2", borderColor)} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex min-w-0 items-center gap-2.25 max-[760px]:flex-wrap max-[760px]:gap-x-1.5 max-[760px]:gap-y-1.25">
                                            <h3 className="min-w-0 overflow-hidden truncate text-[.98rem] font-black text-primary-light max-[760px]:text-[.9rem]">{person.name}</h3>
                                            <div className="flex shrink-0 items-center gap-1 max-[760px]:gap-0.75">
                                                {person.badges.map((badge) => (
                                                    <RankingBadge badge={badge} compact key={badge} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="mt-1 overflow-hidden truncate text-[.65rem] font-black uppercase tracking-[.08em] text-primary max-[760px]:text-[.6rem]">{person.title}</p>
                                    </div>
                                    <ExperienceProgress level={person.level} xp={person.exp} progress={person.progress} showLevelShadow={false} className="hidden shrink-0 max-[760px]:block" levelClassName="text-[.65rem]" levelValueClassName="text-[.96rem]" xpClassName="hidden" progressClassName="hidden" />
                                </div>
                                <ExperienceProgress level={person.level} xp={person.exp} progress={person.progress} showLevelShadow={false} className={cn("max-[760px]:hidden", borderColor)} levelClassName="text-[.62rem]" levelValueClassName="text-[.98rem]" xpClassName="text-[.78rem]" progressClassName="mt-2.5 h-[15px]" />
                            </article>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
