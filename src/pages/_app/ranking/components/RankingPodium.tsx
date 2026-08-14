import { ManaSeedSpriteLayers } from "@/components/ManaSeed/ManaSeedSpriteLayers";
import { CrownIcon } from "@/components/icons";
import { RankingBadge } from "./RankingBadge";
import { MANA_SEED_FREE } from "@/mocks/data/mana-seed";
import type { RankingLeader } from "@/types/ranking";
import { cn } from "@/lib/tailwind";
import { getManaSeedLayers } from "@/utils/mana-seed";

const podiumOrder = [2, 1, 3] as const;

const leaderPlacement = {
    1: "left-1/2 bottom-[37.5%] w-[30%] -translate-x-1/2",
    2: "bottom-[26.5%] left-[3.5%] w-[29%]",
    3: "bottom-[20.5%] right-[3.5%] w-[29%]",
} as const;

export function RankingPodium({ leaders }: { leaders: RankingLeader[] }) {
    const orderedLeaders = podiumOrder.map((position) => leaders.find((leader) => leader.position === position)).filter((leader): leader is RankingLeader => Boolean(leader));

    return (
        <div className="relative z-[4] mx-auto mt-2.5 h-[clamp(300px,52vw,530px)] w-full max-w-[1020px]" role="list" aria-label="Pódio dos três melhores aventureiros">
            <img
                src="/images/assets/podio.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-[13.2%] left-0 w-full select-none [image-rendering:pixelated]"
            />
            {orderedLeaders.map((leader) => {
                const first = leader.position === 1;
                return (
                    <article className={cn("absolute flex flex-col items-center text-center", leaderPlacement[leader.position])} key={leader.position} role="listitem">
                        <div
                            className={cn(
                                "relative z-[2] w-[88%] min-h-[68px] border-2 border-[var(--color-orange-dark)] bg-[var(--color-black-overlay)] px-2 py-1.5 shadow-[3px_3px_0_var(--color-black-overlay),inset_0_0_0_1px_var(--color-orange-overlay)] max-[760px]:min-h-[50px] max-[760px]:w-[98%] max-[760px]:px-1 max-[760px]:py-1",
                                first && "border-[var(--color-orange)] bg-[linear-gradient(135deg,var(--color-orange-overlay),var(--color-black-overlay))] shadow-[0_0_0_1px_var(--color-orange-dark),4px_4px_0_var(--color-black-overlay),inset_0_0_0_1px_var(--color-orange-overlay)]",
                            )}
                        >
                            {first ? <CrownIcon className="absolute left-1/2 top-[-23px] h-7 w-7 -translate-x-1/2 text-[var(--color-primary)] [filter:drop-shadow(2px_2px_0_var(--color-orange-dark))] max-[760px]:top-[-18px] max-[760px]:h-5 max-[760px]:w-5" /> : null}
                            <div className="flex min-w-0 items-center justify-center gap-1 max-[760px]:gap-0.5">
                                <strong className="block min-w-0 overflow-hidden truncate text-[clamp(.5rem,1.25vw,.72rem)] text-white max-[760px]:text-[clamp(.42rem,2vw,.55rem)]">{leader.name}</strong>
                                <div className="flex shrink-0 items-center justify-center gap-0.5">
                                    {leader.badges.map((badge) => (
                                        <RankingBadge badge={badge} compact key={badge} />
                                    ))}
                                </div>
                            </div>
                            <div className="mt-1 flex items-center justify-center gap-1.5 text-[.45rem] font-black uppercase tracking-[.08em] text-[var(--color-orange)] max-[760px]:mt-0.5 max-[760px]:gap-1 max-[760px]:text-[.34rem]">
                                <span>Nível {leader.level}</span>
                                <span className="border-l border-[var(--color-orange-dark)] pl-1.5 text-[var(--color-orange)] max-[760px]:pl-1">{leader.exp} XP</span>
                            </div>
                        </div>
                        <div className="relative z-[1] -mt-1 h-[clamp(105px,19vw,190px)] w-[clamp(105px,19vw,190px)] [filter:drop-shadow(7px_8px_0_var(--color-black-overlay))] max-[760px]:h-[clamp(82px,27vw,120px)] max-[760px]:w-[clamp(82px,27vw,120px)]">
                            <ManaSeedSpriteLayers frame={MANA_SEED_FREE.staticAvatarFrame} layers={getManaSeedLayers(leader.appearance)} />
                        </div>
                        <span className="sr-only">{leader.position}º lugar</span>
                    </article>
                );
            })}
        </div>
    );
}
