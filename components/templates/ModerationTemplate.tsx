"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GridIcon } from "@/components/atoms/icons";
import { PageHeader } from "@/components/molecules/PageHeader";
import { EvidenceQueue } from "@/components/organisms/EvidenceQueue";
import { ModerationFilters } from "@/components/organisms/ModerationFilters";
import { AppShell } from "@/components/templates/AppShell";
import { moderationService } from "@/services/moderation-service";
import type { EvidenceSubmission } from "@/types/moderation";

const collaborators = moderationService.collaborators();
const missions = moderationService.missions();

export function ModerationTemplate() {
  const router = useRouter();
  const [collaboratorQuery, setCollaboratorQuery] = useState("");
  const [missionId, setMissionId] = useState("");
  const [evidences, setEvidences] = useState<EvidenceSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const initialLoad = useRef(true);
  const selectedCollaborator = useMemo(() => collaborators.find((item) => item.name.toLocaleLowerCase("pt-BR") === collaboratorQuery.trim().toLocaleLowerCase("pt-BR")), [collaboratorQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedCollaborator) params.set("userId", selectedCollaborator.id);
      if (missionId) params.set("missionId", missionId);
      window.history.replaceState(null, "", params.size ? `/moderation?${params}` : "/moderation");
      setLoading(true);
      moderationService.list({ userId: selectedCollaborator?.id, missionId: missionId || undefined, collaboratorQuery: selectedCollaborator ? undefined : collaboratorQuery }).then((data) => { setEvidences(data); setLoading(false); });
      initialLoad.current = false;
    }, initialLoad.current ? 0 : 350);
    return () => window.clearTimeout(timer);
  }, [collaboratorQuery, missionId, selectedCollaborator]);

  const count = <div className="flex items-center gap-2 border-2 border-[#5c421c] bg-[#17160f] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gold-light shadow-[4px_4px_0_#080705]"><GridIcon className="h-4 w-4" />{loading ? "Atualizando fila" : `${evidences.length} pendência${evidences.length === 1 ? "" : "s"}`}</div>;

  return <AppShell><PageHeader eyebrow="Moderação · OS-1" title="Fila de evidências" description="Analise as entregas pendentes da guilda e avance para os detalhes de cada registro." action={count} /><section className="pixel-panel mt-8 overflow-hidden"><ModerationFilters collaborators={collaborators} missions={missions} collaboratorQuery={collaboratorQuery} missionId={missionId} onCollaboratorChange={setCollaboratorQuery} onMissionChange={setMissionId} onClear={() => { setCollaboratorQuery(""); setMissionId(""); }} /><EvidenceQueue evidences={evidences} loading={loading} onOpen={(id) => router.push(`/moderation/${id}`)} /></section><p className="mt-4 text-[10px] text-[#747067]">A fila é ordenada da evidência mais antiga para a mais recente. A busca utiliza debounce de 350 ms.</p></AppShell>;
}
