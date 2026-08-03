"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GameNav } from "@/components/GameNav";
import { ChevronIcon, GridIcon, ScrollIcon } from "@/components/icons";
import { EvidenceSubmission, getEvidenceQueue, getModerationCollaborators, getModerationMissions } from "@/lib/moderation";

const collaborators = getModerationCollaborators();
const missions = getModerationMissions();

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default function ModerationPage() {
  const router = useRouter();
  const [collaboratorQuery, setCollaboratorQuery] = useState("");
  const [missionId, setMissionId] = useState("");
  const [evidences, setEvidences] = useState<EvidenceSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const initialLoad = useRef(true);

  const selectedCollaborator = useMemo(
    () => collaborators.find((collaborator) => collaborator.name.toLocaleLowerCase("pt-BR") === collaboratorQuery.trim().toLocaleLowerCase("pt-BR")),
    [collaboratorQuery]
  );

  useEffect(() => {
    const delay = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedCollaborator) params.set("userId", selectedCollaborator.id);
      if (missionId) params.set("missionId", missionId);
      const queryString = params.toString();
      window.history.replaceState(null, "", queryString ? `/moderation?${queryString}` : "/moderation");

      setLoading(true);
      getEvidenceQueue({ userId: selectedCollaborator?.id, missionId: missionId || undefined, collaboratorQuery: selectedCollaborator ? undefined : collaboratorQuery }).then((data) => {
        setEvidences(data);
        setLoading(false);
      });
      initialLoad.current = false;
    }, initialLoad.current ? 0 : 350);

    return () => window.clearTimeout(delay);
  }, [collaboratorQuery, missionId, selectedCollaborator]);

  function clearFilters() {
    setCollaboratorQuery("");
    setMissionId("");
  }

  const hasFilters = Boolean(collaboratorQuery || missionId);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_78%_9%,rgba(112,74,21,.17),transparent_24%),linear-gradient(rgba(7,8,7,.90),rgba(7,8,7,.98)),url('/art/quest-landscape.png')] bg-cover bg-fixed bg-center">
      <GameNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Moderação · OS-1</p><h1 className="pixel-title mt-2 text-3xl sm:text-4xl">Fila de evidências</h1><p className="mt-3 max-w-2xl text-sm text-[#9f9a89]">Analise as entregas pendentes da guilda e avance para os detalhes de cada registro.</p></div><div className="flex items-center gap-2 border-2 border-[#5c421c] bg-[#17160f] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gold-light shadow-[4px_4px_0_#080705]"><GridIcon className="h-4 w-4" /> {loading ? "Atualizando fila" : `${evidences.length} pendência${evidences.length === 1 ? "" : "s"}`}</div></header>

        <section className="pixel-panel mt-8 overflow-hidden">
          <div className="border-b-2 border-[#5d431d] bg-[#17160f] p-5 sm:px-7"><p className="eyebrow">R1-02 · Filtros da fila</p><div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"><label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-gold-light">Pesquisar colaborador</span><input list="moderation-collaborators" value={collaboratorQuery} onChange={(event) => setCollaboratorQuery(event.target.value)} placeholder="Digite ou selecione um colaborador" className="w-full border-2 border-[#76521e] bg-[#0c0f0c] px-4 py-3 text-sm text-cream outline-none shadow-[inset_3px_3px_0_#060705] placeholder:text-[#5e5d55] focus:border-gold" /><datalist id="moderation-collaborators">{collaborators.map((collaborator) => <option key={collaborator.id} value={collaborator.name} />)}</datalist></label><label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-gold-light">Filtrar por missão</span><select value={missionId} onChange={(event) => setMissionId(event.target.value)} className="w-full border-2 border-[#76521e] bg-[#0c0f0c] px-4 py-3 text-sm text-cream outline-none shadow-[inset_3px_3px_0_#060705] focus:border-gold"><option value="">Todas as missões</option>{missions.map((mission) => <option key={mission.id} value={mission.id}>{mission.title}</option>)}</select></label><button type="button" onClick={clearFilters} disabled={!hasFilters} className="pixel-button pixel-button-secondary h-[46px] px-5 py-3 text-[10px] disabled:cursor-not-allowed disabled:opacity-45">Limpar</button></div></div>
          <div className="hidden grid-cols-[1.1fr_1.25fr_.8fr_.8fr_auto] gap-4 border-b-2 border-[#4d391b] bg-[#12130f] px-7 py-4 text-[10px] font-black uppercase tracking-wider text-[#9d947e] md:grid"><span>Colaborador</span><span>Missão</span><span>Evidência</span><span>Submetida em</span><span>Status</span></div>
          {loading ? <div className="p-10 text-center text-sm text-[#999383]">Buscando evidências pendentes...</div> : evidences.length === 0 ? <div className="p-10 text-center"><ScrollIcon className="mx-auto h-8 w-8 text-[#71552b]" /><p className="mt-3 text-sm font-black text-[#d7c5a0]">Nenhuma pendência encontrada</p><p className="mt-1 text-xs text-[#878174]">Ajuste ou limpe os filtros para consultar a fila completa.</p></div> : evidences.map((evidence) => <button key={evidence.id} onClick={() => router.push(`/moderation/${evidence.id}`)} className="group grid w-full gap-4 border-b-2 border-[#302a1b] px-5 py-5 text-left transition last:border-b-0 hover:bg-[#1c1a10] focus:bg-[#1c1a10] focus:outline-none md:grid-cols-[1.1fr_1.25fr_.8fr_.8fr_auto] md:items-center md:px-7"><span className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-[#76521e] bg-[#292010] text-[10px] font-black text-gold-light">{evidence.collaborator.initials}</span><span><span className="block text-sm font-black text-[#ebdbb8]">{evidence.collaborator.name}</span><span className="mt-1 block text-[10px] text-[#7e796c] md:hidden">{evidence.missionTitle}</span></span></span><span className="hidden text-xs font-bold text-[#c3bca8] md:block">{evidence.missionTitle}</span><span className="text-xs text-[#aaa18c]">{evidence.evidenceType}</span><span className="text-xs text-[#9d9787]">{formatDate(evidence.submittedAt)}</span><span className="flex items-center justify-between gap-3"><span className="border-2 border-[#876125] bg-[#30230f] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-gold-light">{evidence.status}</span><ChevronIcon className="h-4 w-4 text-[#987235] transition group-hover:translate-x-1 group-hover:text-gold-light" /></span></button>)}
        </section>
        <p className="mt-4 text-[10px] text-[#747067]">A fila é ordenada da evidência submetida há mais tempo para a mais recente. A busca por colaborador utiliza debounce de 350 ms.</p>
      </main>
    </div>
  );
}
