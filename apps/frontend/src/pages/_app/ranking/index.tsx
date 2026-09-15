import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RankingPodium } from "./components/RankingPodium";
import { RankingTable } from "./components/RankingTable";
import { getManaSeedTexture, getManaSeedVisibleTexture, loadManaSeedTexture } from "@/components/ManaSeed/textures";
import { Loading } from "@/components/ui/Loading";
import { BLEED_UNDER_RETURN_LINK } from "@/components/ui/StoneWall";
import { renderTextWithNumericFont } from "@/lib/typography";
import { RANKING_ENTRIES, RANKING_LEADERS, RANKING_UPDATED_AT } from "@/mocks/data/ranking";
import { formatDate } from "@/utils/date";
import { getManaSeedLayers } from "@/utils/mana-seed";

const pergaminho = "/images/assets/pergaminho.png";
const rankingImages = [pergaminho, "/images/assets/podio.png", "/images/backgrounds/hall.png", "/images/backgrounds/parede-pedra.png"];
let rankingAssetsLoaded = false;
let rankingAssetsPromise: Promise<void> | undefined;

async function preloadImage(src: string) {
    const image = new Image();
    image.decoding = "async";
    image.src = src;

    try {
        await image.decode();
    } catch {
        await new Promise<void>((resolve) => {
            if (image.complete) return resolve();
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
        });
    }
}

function loadRankingAssets(layers: ReturnType<typeof getManaSeedLayers>) {
    rankingAssetsPromise ??= (async () => {
        const missingTextures = layers.filter((layer) => getManaSeedTexture(layer) === null);
        await Promise.all(missingTextures.map(loadManaSeedTexture));

        const imageSources = new Set([...rankingImages, ...layers.map(getManaSeedVisibleTexture)]);
        const fontsReady = "fonts" in document ? document.fonts.ready.then(() => undefined) : Promise.resolve();
        await Promise.all([[...imageSources].map(preloadImage), fontsReady].flat());
        rankingAssetsLoaded = true;
    })();

    return rankingAssetsPromise;
}

export const Route = createFileRoute("/_app/ranking/")({
    component: RankingPage,
});

function RankingPage() {
    const reduceMotion = useReducedMotion();
    const [assetsLoaded, setAssetsLoaded] = useState(rankingAssetsLoaded);
    const rankingLayers = useMemo(() => [...RANKING_LEADERS.flatMap((leader) => getManaSeedLayers(leader.appearance, leader.bodyType, leader.colors)), ...RANKING_ENTRIES.flatMap((entry) => getManaSeedLayers(entry.appearance))], []);

    useEffect(() => {
        let active = true;

        void loadRankingAssets(rankingLayers).then(() => {
            if (active) setAssetsLoaded(true);
        });

        return () => {
            active = false;
        };
    }, [rankingLayers]);

    if (!assetsLoaded) {
        return (
            <main className={`min-h-[calc(100vh-5.5rem)] overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
                <Loading message="Preparando o Hall da Fama..." className="min-h-[calc(100vh-5.5rem)] uppercase tracking-[.12em]" />
            </main>
        );
    }

    return (
        <main className={`overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
            <section className="relative min-h-185 overflow-hidden border-b-8 border-(--color-black) bg-(--color-black) bg-[url('/images/backgrounds/hall.png')] bg-cover bg-position-[center_46%] px-4 pt-7.5 shadow-[inset_0_-20px_48px_var(--color-black-overlay),inset_0_8px_28px_var(--color-black-overlay)] max-[760px]:min-h-152.5 max-[760px]:bg-position-[center_top] max-[760px]:bg-size-[auto_100%] max-[760px]:px-1.5 max-[760px]:pt-15">
                <div className="pointer-events-none absolute inset-0 z-0 bg-[rgb(15_14_14/45%)]" aria-hidden="true" />
                <header className="relative z-5 mx-auto grid aspect-2172/724 w-[min(840px,calc(100%-32px))] place-items-center text-center max-[760px]:w-[min(100%,calc(100%-14px))] max-[760px]:translate-y-5">
                    <motion.img initial={reduceMotion ? false : { opacity: 0, y: -32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} src={pergaminho} alt="" loading="eager" className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain" />
                    <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduceMotion ? 0 : 0.2, duration: 0.2, ease: "easeOut" }} className="relative z-1 w-[min(76%,560px)] translate-y-[-8%] p-[3%_2%_2%] uppercase max-[760px]:w-[78%] max-[760px]:translate-y-0 max-[760px]:p-0">
                        <p className="text-[.7rem] font-black tracking-[.26em] text-[#212638] max-[760px]:text-[.5rem] max-[760px]:leading-none max-[760px]:tracking-[.2em]">{renderTextWithNumericFont("Ranking de Aventureiros · Temporada 2026")}</p>
                        <h1 id="ranking-title" className="my-1 text-[clamp(1.65rem,4.6vw,2.9rem)] font-black leading-[1.1] tracking-[.08em] text-[#212638] [-webkit-text-stroke:1px_#ffd45a] [paint-order:stroke_fill] [text-shadow:2px_2px_0_#b88620] max-[760px]:mx-auto max-[760px]:mt-2 max-[760px]:mb-0 max-[760px]:max-w-72.5 max-[760px]:-translate-y-1 max-[760px]:text-[clamp(1.25rem,5.8vw,1.55rem)] max-[760px]:leading-none">
                            Hall da Fama
                        </h1>
                    </motion.div>
                </header>
                <RankingPodium leaders={RANKING_LEADERS} />
            </section>
            <section className="min-h-140 border-t-[3px] border-primary-dark bg-[linear-gradient(var(--color-black-overlay),var(--color-black-overlay)),url('/images/backgrounds/parede-pedra.png')] bg-cover bg-fixed bg-position-[center_75%] px-4 pb-9 pt-13 max-[760px]:px-2.5 max-[760px]:pb-7.5 max-[760px]:pt-8.5">
                <RankingTable entries={RANKING_ENTRIES} />
                <motion.p initial={reduceMotion ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, ease: "easeOut" }} className="mt-7 text-center text-[.58rem] font-black uppercase tracking-[.16em] text-primary-light">
                    {renderTextWithNumericFont(`Última atualização: ${formatDate(RANKING_UPDATED_AT, "full")}`)}
                </motion.p>
            </section>
        </main>
    );
}
