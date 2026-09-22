import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { GridIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { BLEED_UNDER_RETURN_LINK, HALL_PANEL, StoneWall } from "@/components/ui/StoneWall";
import { EvidenceQueue } from "./components/EvidenceQueue";
import { ModerationFilters } from "./components/ModerationFilters";
import { cn } from "@/lib/tailwind";
import { moderationService } from "@/api/moderation";
import type { EvidenceSubmission } from "@/types/moderation";
import { renderTextWithNumericFont } from "@/lib/typography";

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
    const { data: all = [], isPending: loading, error } = useQuery({ queryKey: ["admin", "submissions"], queryFn: moderationService.all });
    const [showHistory, setShowHistory] = useState(false);
    const collaborators = useMemo(() => [...new Map(all.map((item) => [item.collaborator.id, item.collaborator])).values()], [all]);
    const missions = useMemo(() => [...new Map(all.map((item) => [item.missionId, { id: item.missionId, title: item.missionTitle }])).values()], [all]);
    const selectedCollaborator = useMemo(() => collaborators.find((item) => item.name.toLocaleLowerCase("pt-BR") === collaboratorQuery.trim().toLocaleLowerCase("pt-BR")), [collaboratorQuery, collaborators]);
    const filtered = useMemo(() => all.filter((item) => (!missionId || item.missionId === missionId) && (!selectedCollaborator || item.collaborator.id === selectedCollaborator.id) && (!collaboratorQuery || item.collaborator.name.toLocaleLowerCase("pt-BR").includes(collaboratorQuery.toLocaleLowerCase("pt-BR")))), [all, missionId, selectedCollaborator, collaboratorQuery]);
    const evidences: EvidenceSubmission[] = filtered.filter((item) => item.status === "Ativa");
    const history: EvidenceSubmission[] = filtered.filter((item) => item.status !== "Ativa");

    const actions = (
        <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 border-2 border-primary bg-black px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary-light shadow-[4px_4px_0_var(--color-primary-dark)]">
                <GridIcon className="h-4 w-4" />
                {renderTextWithNumericFont(loading ? "Atualizando" : showHistory ? history.length + " registro" + (history.length === 1 ? "" : "s") : evidences.length + " entrega" + (evidences.length === 1 ? "" : "s"))}
            </div>
            <Button type="button" variant="secondary" aria-pressed={showHistory} onClick={() => setShowHistory((current) => !current)} className="border-primary-dark px-5 text-[10px] text-primary-light">
                {showHistory ? "Ver entregas" : "Histórico"}
            </Button>
        </div>
    );

    return (
        <main className={`flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
            <StoneWall>
                <div className="mx-auto w-[min(1180px,100%)]">
                    <PageHeader eyebrow="Consulta de entregas" title={showHistory ? "Histórico de alterações" : "Entregas da guilda"} description={showHistory ? "Consulte cancelamentos e invalidações registrados." : "Consulte as entregas e invalide registros quando necessário."} action={actions} />
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
                        {error ? <p role="alert" className="p-5 text-sm text-red-light">{error.message}</p> : <EvidenceQueue evidences={showHistory ? history : evidences} loading={loading} onOpen={(id) => navigate({ to: "/moderation/$id", params: { id } })} emptyTitle={showHistory ? "Nenhum registro encontrado" : undefined} emptyDescription={showHistory ? "Cancelamentos e invalidações aparecerão aqui." : undefined} />}
                    </Card>
                </div>
            </StoneWall>
        </main>
    );
}
