import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/PageHeader";
import { GridIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { EvidenceQueue } from "./components/EvidenceQueue";
import { ModerationFilters } from "./components/ModerationFilters";
import { moderationService } from "@/mocks/services/moderation";
import type { EvidenceSubmission } from "@/types/moderation";

const collaborators = moderationService.collaborators();
const missions = moderationService.missions();

export type ModerationSearch = {
    userId?: string;
    missionId?: string;
};

export const Route = createFileRoute("/_app/moderation/")({
    validateSearch: (search): ModerationSearch => ({
        userId: typeof search.userId === "string" ? search.userId : undefined,
        missionId: typeof search.missionId === "string" ? search.missionId : undefined,
    }),
    component: ModerationPage,
});

function ModerationPage() {
    const navigate = useNavigate();
    const [collaboratorQuery, setCollaboratorQuery] = useState("");
    const [missionId, setMissionId] = useState("");
    const [evidences, setEvidences] = useState<EvidenceSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const initialLoad = useRef(true);
    const selectedCollaborator = useMemo(() => collaborators.find((item) => item.name.toLocaleLowerCase("pt-BR") === collaboratorQuery.trim().toLocaleLowerCase("pt-BR")), [collaboratorQuery]);

    useEffect(() => {
        const timer = window.setTimeout(
            () => {
                const params = new URLSearchParams();
                if (selectedCollaborator) params.set("userId", selectedCollaborator.id);
                if (missionId) params.set("missionId", missionId);
                navigate({ to: "/moderation", search: params.size ? { userId: params.get("userId") ?? undefined, missionId: params.get("missionId") ?? undefined } : {} });
                setLoading(true);
                moderationService.list({ userId: selectedCollaborator?.id, missionId: missionId || undefined, collaboratorQuery: selectedCollaborator ? undefined : collaboratorQuery }).then((data) => {
                    setEvidences(data);
                    setLoading(false);
                });
                initialLoad.current = false;
            },
            initialLoad.current ? 0 : 350,
        );
        return () => window.clearTimeout(timer);
    }, [collaboratorQuery, missionId, selectedCollaborator, navigate]);

    const count = (
        <div className="flex items-center gap-2 border-2 border-[var(--color-orange-dark)] bg-[var(--color-primary-dark)] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary-light shadow-[4px_4px_0_var(--color-orange-dark)]">
            <GridIcon className="h-4 w-4" />
            {loading ? "Atualizando fila" : evidences.length + " pendência" + (evidences.length === 1 ? "" : "s")}
        </div>
    );

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
            <PageHeader eyebrow="Moderação · OS-1" title="Fila de evidências" description="Analise as entregas pendentes da guilda e avance para os detalhes de cada registro." action={count} />
            <Card className="mt-8 overflow-hidden">
                <ModerationFilters
                    collaborators={collaborators}
                    missions={missions}
                    collaboratorQuery={collaboratorQuery}
                    missionId={missionId}
                    onCollaboratorChange={setCollaboratorQuery}
                    onMissionChange={setMissionId}
                    onClear={() => {
                        setCollaboratorQuery("");
                        setMissionId("");
                    }}
                />
                <EvidenceQueue evidences={evidences} loading={loading} onOpen={(id) => navigate({ to: "/moderation/$id", params: { id } })} />
            </Card>
            <p className="mt-4 text-[10px] text-[var(--color-black-muted)]">A fila é ordenada da evidência mais antiga para a mais recente. A busca utiliza debounce de 350 ms.</p>
        </main>
    );
}
