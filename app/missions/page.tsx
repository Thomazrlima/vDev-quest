"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameNav } from "@/components/GameNav";
import { Mission, getMissions } from "@/lib/missions";
import { ScrollIcon, SparkIcon } from "@/components/icons";

export default function MissionsPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    getMissions().then((data) => { setMissions(data); setLoading(false); });
    setPublished(new URLSearchParams(window.location.search).get("published") === "1");
  }, []);

  return <div className="min-h-screen bg-[linear-gradient(rgba(7,8,7,.90),rgba(7,8,7,.98)),url('/art/quest-landscape.png')] bg-cover bg-fixed bg-center"><GameNav /><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"><header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Gestão de missões · OS-1</p><h1 className="pixel-title mt-2 text-3xl sm:text-4xl">Quadro de missões</h1><p className="mt-3 text-sm text-[#9f9a89]">Crie desafios para a guilda e acompanhe o status de cada jornada.</p></div><button onClick={() => router.push("/missions/new")} className="pixel-button px-5 py-4 text-[11px]"><SparkIcon className="h-4 w-4" /> Nova missão</button></header>{published ? <div role="status" className="mt-7 border-2 border-[#597946] bg-[#1b2c1a] px-4 py-3 text-xs font-bold text-[#a6d783]">Missão publicada com sucesso. Ela já está disponível para a guilda.</div> : null}<section className="pixel-panel mt-8 overflow-hidden"><div className="grid grid-cols-[1fr_auto] border-b-2 border-[#5d431d] bg-[#17160f] px-5 py-4 text-[10px] font-black uppercase tracking-wider text-[#9d947e] sm:grid-cols-[1.4fr_.7fr_.7fr_auto] sm:px-7"><span>Missão</span><span className="hidden sm:block">Evidência</span><span className="hidden sm:block">Recompensa</span><span>Ações</span></div>{loading ? <p className="p-8 text-center text-sm text-[#999383]">Carregando missões...</p> : missions.map((mission) => <article key={mission.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b-2 border-[#302a1b] px-5 py-5 last:border-b-0 sm:grid-cols-[1.4fr_.7fr_.7fr_auto] sm:px-7"><div className="flex min-w-0 gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[#72501d] bg-[#251c0f] text-gold"><ScrollIcon className="h-5 w-5" /></span><div className="min-w-0"><h2 className="truncate text-sm font-black text-[#ebdbb8]">{mission.title}</h2><p className="mt-1 text-[10px] text-[#878174]">{mission.hasProgress ? "Em andamento · edição bloqueada" : `${mission.status} · ${mission.updatedAt}`}</p></div></div><span className="hidden text-xs text-[#a9a18e] sm:block">{mission.evidenceType}</span><span className="hidden text-xs font-black text-gold-light sm:block">{mission.xp} EXP</span><button onClick={() => router.push(`/missions/${mission.id}/edit`)} className="border-2 border-[#78551f] bg-[#21190e] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gold-light shadow-[3px_3px_0_#060705] hover:border-gold hover:bg-[#342510]">{mission.hasProgress ? "Ver" : "Editar"}</button></article>)}</section><p className="mt-4 text-[10px] text-[#747067]">Demonstração: abra “Sprint dos guardiões” para visualizar o bloqueio de edição por progresso.</p></main></div>;
}
