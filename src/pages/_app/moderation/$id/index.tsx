import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronIcon, ScrollIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DetailCard } from "@/components/ui/DetailCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Loading } from "@/components/ui/Loading";
import { BLEED_UNDER_RETURN_LINK, HALL_PANEL, StoneWall } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import { moderationService } from "@/mocks/services/moderation";
import type { EvidenceSubmission } from "@/types/moderation";
import { formatDate } from "@/utils/date";

export const Route = createFileRoute("/_app/moderation/$id/")({
    component: EvidenceDetailsPage,
});

function EvidenceDetailsPage() {
    const { id: evidenceId } = Route.useParams();
    const navigate = useNavigate();
    const [evidence, setEvidence] = useState<EvidenceSubmission | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        moderationService.getById(evidenceId).then((data) => {
            setEvidence(data);
            setLoading(false);
        });
    }, [evidenceId]);

    return (
        <main className={`flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
            <StoneWall>
                <div className="mx-auto w-[min(768px,100%)]">
                    <Button variant="ghost" onClick={() => navigate({ to: "/moderation" })} className="mb-7 p-0 text-[11px] text-primary hover:text-primary-light">
                        <ChevronIcon className="h-4 w-4 rotate-180" /> Fila de moderação
                    </Button>
                    {loading ? (
                        <Card className={HALL_PANEL}>
                            <Loading message="Carregando evidência..." />
                        </Card>
                    ) : !evidence ? (
                        <Card className={cn("p-8 text-center", HALL_PANEL)}>
                            <p className="text-sm text-primary-light">Evidência não encontrada.</p>
                        </Card>
                    ) : (
                        <Card className={cn("overflow-hidden", HALL_PANEL)}>
                            <div className="border-b-2 border-primary-dark bg-black p-6">
                                <Eyebrow>FE-03 / FE-04 · Detalhe da evidência</Eyebrow>
                                <Heading className="mt-2">Entrega de {evidence.collaborator.name}</Heading>
                                <p className="mt-2 text-sm text-white-muted">Registro pendente para a missão “{evidence.missionTitle}”.</p>
                            </div>
                            <div className="grid gap-5 bg-black-overlay p-6 sm:grid-cols-2">
                                <DetailCard label="Missão" value={evidence.missionTitle} />
                                <DetailCard label="Tipo enviado" value={evidence.evidenceType} />
                                <DetailCard label="Arquivo" value={evidence.fileName} />
                                <DetailCard label="Submetida em" value={formatDate(evidence.submittedAt, "full")} />
                            </div>
                            <div className="border-t-2 border-primary-dark bg-black p-6 text-xs text-white-muted">
                                <ScrollIcon className="mr-2 inline h-4 w-4 text-primary" /> Ações de aprovar ou reprovar serão disponibilizadas nas interfaces FE-03/FE-04.
                            </div>
                        </Card>
                    )}
                </div>
            </StoneWall>
        </main>
    );
}
