"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SparkIcon } from "@/components/atoms/icons";
import { PageHeader } from "@/components/molecules/PageHeader";
import { MissionList } from "@/components/organisms/MissionList";
import { AppShell } from "@/components/templates/AppShell";
import { missionService } from "@/services/mission-service";
import type { Mission } from "@/types/mission";

export function MissionsTemplate() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [published, setPublished] = useState(false);

  useEffect(() => { missionService.list().then((data) => { setMissions(data); setLoading(false); }); setPublished(new URLSearchParams(window.location.search).get("published") === "1"); }, []);

  const actions = <div className="flex flex-wrap gap-3"><button onClick={() => router.push("/moderation")} className="pixel-button pixel-button-secondary px-5 py-4 text-[11px]">Fila de moderação</button><button onClick={() => router.push("/missions/new")} className="pixel-button px-5 py-4 text-[11px]"><SparkIcon className="h-4 w-4" /> Nova missão</button></div>;

  return <AppShell width="max-w-6xl"><PageHeader eyebrow="Gestão de missões · OS-1" title="Quadro de missões" description="Crie desafios para a guilda, acompanhe a jornada e revise suas evidências." action={actions} />{published ? <div role="status" className="mt-7 border-2 border-[#597946] bg-[#1b2c1a] px-4 py-3 text-xs font-bold text-[#a6d783]">Missão publicada com sucesso. Ela já está disponível para a guilda.</div> : null}<MissionList missions={missions} loading={loading} onOpen={(mission) => router.push(`/missions/${mission.id}/edit`)} /><p className="mt-4 text-[10px] text-[#747067]">Demonstração: abra “Sprint dos guardiões” para visualizar o bloqueio de edição por progresso.</p></AppShell>;
}
