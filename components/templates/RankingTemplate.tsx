import { CrownIcon } from "@/components/atoms/icons";
import { PageHeader } from "@/components/molecules/PageHeader";
import { RankingPodium } from "@/components/organisms/RankingPodium";
import { RankingTable } from "@/components/organisms/RankingTable";
import { AppShell } from "@/components/templates/AppShell";
import { RANKING_ENTRIES, RANKING_LEADERS } from "@/data/ranking";

export function RankingTemplate() {
  return <AppShell><div className="mx-auto mb-4 flex w-fit items-center gap-3 text-gold"><span className="h-[2px] w-10 bg-gradient-to-r from-transparent to-gold" /><CrownIcon className="h-7 w-7" /><span className="h-[2px] w-10 bg-gradient-to-l from-transparent to-gold" /></div><PageHeader centered eyebrow="Salão da glória · Temporada III" title="Ranking de aventureiros" description="Os maiores heróis, os códigos mais lendários. Conquiste cupons e escreva seu nome no topo." /><RankingPodium leaders={RANKING_LEADERS} /><RankingTable entries={RANKING_ENTRIES} /><p className="mt-7 text-center text-[10px] uppercase tracking-[0.16em] text-[#69665d]">O ranking reinicia em 12 dias · continue sua jornada</p></AppShell>;
}
