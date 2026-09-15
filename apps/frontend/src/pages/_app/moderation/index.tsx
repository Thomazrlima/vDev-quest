import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { GridIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { BLEED_UNDER_RETURN_LINK, HALL_PANEL, StoneWall } from "@/components/ui/StoneWall";
import { EvidenceQueue } from "./components/EvidenceQueue";
import { ModerationFilters } from "./components/ModerationFilters";
import { cn } from "@/lib/tailwind";
import { moderationService } from "@/mocks/services/moderation";
import type { EvidenceSubmission } from "@/types/moderation";
import { renderTextWithNumericFont } from "@/lib/typography";

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
    const [history, setHistory] = useState<EvidenceSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
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
                const filters = { userId: selectedCollaborator?.id, missionId: missionId || undefined, collaboratorQuery: selectedCollaborator ? undefined : collaboratorQuery };
                Promise.all([moderationService.list(filters), moderationService.history(filters)]).then(([queue, log]) => {
                    setEvidences(queue);
                    setHistory(log);
                    setLoading(false);
                });
                initialLoad.current = false;
            },
            initialLoad.current ? 0 : 350,
        );
        return () => window.clearTimeout(timer);
    }, [collaboratorQuery, missionId, selectedCollaborator, navigate]);

    const actions = (
        <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 border-2 border-primary bg-black px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary-light shadow-[4px_4px_0_var(--color-primary-dark)]">
                <GridIcon className="h-4 w-4" />
                {renderTextWithNumericFont(loading ? "Atualizando" : showHistory ? history.length + " registro" + (history.length === 1 ? "" : "s") : evidences.length + " pendência" + (evidences.length === 1 ? "" : "s"))}
            </div>
            <Button type="button" variant="secondary" aria-pressed={showHistory} onClick={() => setShowHistory((current) => !current)} className="border-primary-dark px-5 text-[10px] text-primary-light">
                {showHistory ? "Ver fila" : "Histórico"}
            </Button>
        </div>
    );

    return (
        <main className={`flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
            <StoneWall>
                <div className="mx-auto w-[min(1180px,100%)]">
                    <PageHeader eyebrow="Moderação · OS-1" title={showHistory ? "Histórico de moderação" : "Fila de evidências"} description={showHistory ? "Consulte as evidências que já receberam uma decisão da guilda." : "Analise as entregas pendentes da guilda e avance para os detalhes de cada registro."} action={actions} />
                    <Card className={cn("mt-8", HALL_PANEL)}>
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
                        <EvidenceQueue evidences={showHistory ? history : evidences} loading={loading} onOpen={(id) => navigate({ to: "/moderation/$id", params: { id } })} emptyTitle={showHistory ? "Nenhum registro encontrado" : undefined} emptyDescription={showHistory ? "Aprovações e recusas aparecerão aqui depois da moderação." : undefined} />
                    </Card>
                    <p className="mt-7 text-center text-[.58rem] font-black uppercase tracking-[.16em] text-primary-light">{renderTextWithNumericFont("A fila é ordenada da evidência mais antiga para a mais recente. A busca utiliza debounce de 350 ms.")}</p>
                </div>
            </StoneWall>
        </main>
    );
}
