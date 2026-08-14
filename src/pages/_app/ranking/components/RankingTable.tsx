import { ManaSeedAvatar } from "@/components/ManaSeed/ManaSeedAvatar";
import { SparkIcon } from "@/components/icons";
import { RankingBadge } from "./RankingBadge";
import type { RankingEntry } from "@/types/ranking";
import { getManaSeedLayers } from "@/utils/mana-seed";

export function RankingTable({ entries }: { entries: RankingEntry[] }) {
    const rowClass = "grid min-h-[82px] grid-cols-[72px_minmax(280px,1.45fr)_minmax(260px,.9fr)] items-center gap-3.5 border-b border-[var(--color-orange-dark)] bg-[var(--color-black-overlay)] px-6 transition hover:bg-[var(--color-orange-overlay)] odd:bg-[var(--color-black-overlay)] last:border-b-0 max-[760px]:min-h-0 max-[760px]:grid-cols-[38px_minmax(0,1fr)] max-[760px]:grid-rows-[auto_auto] max-[760px]:gap-x-3 max-[760px]:gap-y-2.5 max-[760px]:px-3 max-[760px]:py-3.5";
    return (
        <section className="mx-auto w-[min(1180px,100%)] overflow-hidden border-4 border-[var(--color-orange)] bg-[var(--color-black-overlay)] shadow-[0_0_0_4px_var(--color-orange-dark),10px_11px_0_var(--color-black-overlay),inset_0_0_0_2px_var(--color-orange-overlay)]" aria-labelledby="ranking-table-title">
            <header className="flex items-center justify-between gap-[18px] border-b-[3px] border-[var(--color-orange-dark)] bg-[linear-gradient(90deg,var(--color-orange-dark),var(--color-primary-dark),var(--color-orange-dark))] px-[26px] py-[18px] max-[760px]:items-start max-[760px]:flex-col max-[760px]:p-4">
                <div>
                    <p className="text-[.58rem] font-black uppercase tracking-[.2em] text-[var(--color-orange)]">Classificação geral</p>
                    <h2 id="ranking-table-title" className="mt-1 text-[1.15rem] font-black text-[var(--color-orange-light)]">
                        Ranking de Aventureiros
                    </h2>
                </div>
                <span className="flex items-center gap-2 text-[.58rem] font-black uppercase tracking-[.1em] text-[var(--color-black-muted)]">
                    <SparkIcon className="h-[17px] w-[17px] text-primary" /> Atualizado há 2 min
                </span>
            </header>
            <div className="overflow-x-auto max-[760px]:overflow-visible">
                <div className="min-w-[700px] max-[760px]:min-w-0">
                    <div className="grid min-h-[43px] grid-cols-[72px_minmax(280px,1.45fr)_minmax(260px,.9fr)] items-center gap-3.5 border-b-2 border-[var(--color-orange-dark)] bg-[var(--color-black)] px-6 text-[.6rem] font-black uppercase tracking-[.15em] text-[var(--color-orange)] max-[760px]:hidden" role="row">
                        <span>Pos.</span>
                        <span>Aventureiro</span>
                        <span>Nível / EXP</span>
                    </div>
                    {entries.map((person) => (
                        <article className={rowClass} key={person.position}>
                            <strong className="text-center text-xl text-[var(--color-orange-light)] max-[760px]:col-start-1 max-[760px]:row-span-2 max-[760px]:row-start-1 max-[760px]:grid max-[760px]:place-items-center max-[760px]:border-r max-[760px]:border-[var(--color-orange-dark)] max-[760px]:text-base">{String(person.position).padStart(2, "0")}</strong>
                            <div className="flex min-w-0 items-center gap-[15px] max-[760px]:col-start-2 max-[760px]:gap-2.5">
                                <ManaSeedAvatar size="md" alt={`Retrato de ${person.name}`} layers={getManaSeedLayers(person.appearance)} className="border-[var(--color-orange-dark)] bg-[var(--color-black)] max-[760px]:h-[46px] max-[760px]:w-[46px] max-[760px]:border-2" />
                                <div className="min-w-0">
                                    <div className="flex min-w-0 items-center gap-[9px] max-[760px]:flex-wrap max-[760px]:gap-x-1.5 max-[760px]:gap-y-[5px]">
                                        <h3 className="min-w-0 overflow-hidden truncate text-[.82rem] font-black text-[var(--color-primary-light)] max-[760px]:text-[.72rem]">{person.name}</h3>
                                        <div className="flex shrink-0 items-center gap-1 max-[760px]:gap-[3px]">
                                            {person.badges.map((badge) => (
                                                <RankingBadge badge={badge} compact key={badge} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="mt-1 overflow-hidden truncate text-[.52rem] font-black uppercase tracking-[.08em] text-[var(--color-black-muted)] max-[760px]:text-[.46rem]">{person.title}</p>
                                </div>
                            </div>
                            <div className="min-w-0 max-[760px]:col-start-2 max-[760px]:border-t max-[760px]:border-[var(--color-orange-dark)] max-[760px]:pt-2.5">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="text-[.52rem] font-black uppercase tracking-[.1em] text-[var(--color-black-muted)] max-[760px]:text-[.46rem]">
                                        Nível <strong className="ml-[5px] text-[.85rem] text-primary-light [text-shadow:2px_2px_0_var(--color-orange-dark)] max-[760px]:text-[.72rem]">{person.level}</strong>
                                    </span>
                                    <b className="whitespace-nowrap text-[.67rem] text-[var(--color-orange-light)] max-[760px]:text-[.58rem]">{person.exp} XP</b>
                                </div>
                                <div className="mt-2 h-[13px] border-2 border-[var(--color-orange-dark)] bg-[var(--color-black)] p-[2px] shadow-[inset_2px_2px_0_var(--color-black)] max-[760px]:mt-1.5">
                                    <span className="block h-full bg-[repeating-linear-gradient(90deg,var(--color-primary)_0_8px,var(--color-primary-light)_8px_12px)] shadow-[inset_0_2px_0_var(--color-primary-overlay)]" style={{ width: `${person.progress}%` }} />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
