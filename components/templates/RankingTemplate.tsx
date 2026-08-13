import { LobbyReturnLink } from "@/components/atoms/LobbyReturnLink";
import { RankingPodium } from "@/components/organisms/RankingPodium";
import { RankingTable } from "@/components/organisms/RankingTable";
import { RANKING_ENTRIES, RANKING_LEADERS } from "@/data/ranking";

export function RankingTemplate() {
  return (
    <div className="ranking-page min-h-screen">
      <LobbyReturnLink />
      <main>
        <section className="ranking-castle-hall" aria-labelledby="ranking-title">
          <div className="ranking-castle-backdrop" aria-hidden="true" />

          <header className="ranking-scroll-title">
            <p>Salão da glória · Temporada III</p>
            <h1 id="ranking-title">Hall da Fama</h1>
            <span>Os maiores heróis, as maiores lendas</span>
          </header>

          <RankingPodium leaders={RANKING_LEADERS} />
        </section>

        <section className="ranking-lower-hall">
          <RankingTable entries={RANKING_ENTRIES} />
          <p className="ranking-reset-note">O ranking reinicia em 12 dias <b>·</b> Continue sua jornada</p>
        </section>
      </main>
    </div>
  );
}
