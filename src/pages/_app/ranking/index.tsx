import { createFileRoute } from "@tanstack/react-router";
import { CrownIcon } from "@/components/icons";
import { RankingPodium } from "./components/RankingPodium";
import { RankingTable } from "./components/RankingTable";
import { RANKING_ENTRIES, RANKING_LEADERS } from "@/mocks/data/ranking";

const pergaminho = "/images/assets/pergaminho.png";

export const Route = createFileRoute("/_app/ranking/")({
    component: RankingPage,
});

function RankingPage() {
    return (
        <main className="overflow-x-hidden bg-(--color-black)">
            <section className="relative min-h-185 overflow-hidden border-b-8 border-(--color-black) bg-(--color-black) bg-[url('/images/backgrounds/ranking-castle-hall-v2.png')] bg-cover bg-position-[center_46%] px-4 pt-7.5 shadow-[inset_0_-20px_48px_var(--color-black-overlay),inset_0_8px_28px_var(--color-black-overlay)] max-[760px]:min-h-152.5 max-[760px]:bg-position-[center_top] max-[760px]:bg-size-[auto_100%] max-[760px]:px-1.5">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--color-green-overlay),var(--color-green-overlay)),linear-gradient(90deg,var(--color-black-overlay),transparent_18%_82%,var(--color-black-overlay))]" aria-hidden="true" />
                <div className="absolute left-[7%] top-14 z-1 grid h-47.5 w-20.5 place-items-center border-4 border-b-0 border-orange-dark bg-[linear-gradient(90deg,var(--color-orange-dark),var(--color-orange)_48%,var(--color-orange-dark))] text-(--color-orange) [clip-path:polygon(0_0,100%_0,100%_82%,50%_100%,0_82%)] filter-[drop-shadow(8px_8px_0_var(--color-black-overlay))] max-[760px]:hidden">
                    <CrownIcon className="h-9.5 w-9.5" />
                </div>
                <div className="absolute right-[7%] top-14 z-1 grid h-47.5 w-20.5 place-items-center border-4 border-b-0 border-orange-dark bg-[linear-gradient(90deg,var(--color-orange-dark),var(--color-orange)_48%,var(--color-orange-dark))] text-(--color-orange) [clip-path:polygon(0_0,100%_0,100%_82%,50%_100%,0_82%)] filter-[drop-shadow(8px_8px_0_var(--color-black-overlay))] max-[760px]:hidden">
                    <CrownIcon className="h-9.5 w-9.5" />
                </div>
                <header className="relative z-5 mx-auto grid aspect-2172/724 w-[min(840px,calc(100%-32px))] place-items-center text-center max-[760px]:w-[min(100%,calc(100%-14px))]">
                    <img src={pergaminho} alt="" loading="eager" className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain" />
                    <div className="relative z-1 w-[min(76%,560px)] p-[3%_2%_2%] uppercase max-[760px]:w-[80%] max-[760px]:pt-[4%]">
                        <p className="text-[.58rem] font-black tracking-[.26em] text-(--color-orange) max-[760px]:text-[.46rem]">Salão da glória · Temporada III</p>
                        <h1 id="ranking-title" className="my-1 text-[clamp(1.4rem,4vw,2.5rem)] font-black leading-[1.1] tracking-[.08em] text-(--color-orange) [text-shadow:3px_3px_0_var(--color-orange-dark)] max-[760px]:mx-auto max-[760px]:max-w-72.5 max-[760px]:text-[clamp(.92rem,4.6vw,1.12rem)] max-[760px]:leading-[1.35]">
                            Hall da Fama
                        </h1>
                        <span className="text-[.65rem] font-bold tracking-[.12em] text-(--color-orange) max-[760px]:text-[.49rem]">Os maiores heróis, as maiores lendas</span>
                    </div>
                </header>
                <RankingPodium leaders={RANKING_LEADERS} />
            </section>
            <section className="min-h-140 border-t-[3px] border-orange-dark bg-[linear-gradient(var(--color-black-overlay),var(--color-black-overlay)),url('/images/backgrounds/quest-landscape.png')] bg-cover bg-fixed bg-position-[center_75%] px-4 pb-9 pt-13 max-[760px]:px-2.5 max-[760px]:pb-7.5 max-[760px]:pt-8.5">
                <RankingTable entries={RANKING_ENTRIES} />
                <p className="mt-7 text-center text-[.58rem] font-black uppercase tracking-[.16em] text-(--color-black-muted)">
                    O ranking reinicia em 12 dias <b className="mx-2 text-(--color-orange)">·</b> Continue sua jornada
                </p>
            </section>
        </main>
    );
}
