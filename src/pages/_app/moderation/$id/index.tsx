import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronIcon, ScrollIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Loading } from "@/components/ui/Loading";
import { DetailCard } from "./components/DetailCard";
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
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
            <Button variant="ghost" onClick={() => navigate({ to: "/moderation" })} className="mb-7 p-0 text-[11px]">
                <ChevronIcon className="h-4 w-4 rotate-180" /> Fila de moderação
            </Button>
            {loading ? (
                <Card>
                    <Loading message="Carregando evidência..." />
                </Card>
            ) : !evidence ? (
                <Card className="p-8 text-center">
                    <p className="text-sm text-[var(--color-orange-light)]">Evidência não encontrada.</p>
                </Card>
            ) : (
                <Card className="overflow-hidden">
                    <div className="border-b-2 border-[var(--color-orange-dark)] bg-[var(--color-primary-dark)] p-6">
                        <Eyebrow>FE-03 / FE-04 · Detalhe da evidência</Eyebrow>
                        <Heading className="mt-2">Entrega de {evidence.collaborator.name}</Heading>
                        <p className="mt-2 text-sm text-[var(--color-white-muted)]">Registro pendente para a missão “{evidence.missionTitle}”.</p>
                    </div>
                    <div className="grid gap-5 p-6 sm:grid-cols-2">
                        <DetailCard label="Missão" value={evidence.missionTitle} />
                        <DetailCard label="Tipo enviado" value={evidence.evidenceType} />
                        <DetailCard label="Arquivo" value={evidence.fileName} />
                        <DetailCard label="Submetida em" value={formatDate(evidence.submittedAt, "full")} />
                    </div>
                    <div className="border-t-2 border-[var(--color-orange-dark)] bg-[var(--color-black)] p-6 text-xs text-[var(--color-black-muted)]">
                        <ScrollIcon className="mr-2 inline h-4 w-4 text-primary" /> Ações de aprovar ou reprovar serão disponibilizadas nas interfaces FE-03/FE-04.
                    </div>
                </Card>
            )}
        </main>
    );
}
