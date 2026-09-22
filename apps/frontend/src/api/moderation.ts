import { api } from "@/api/client";
import { history, muralService } from "@/api/mural";
import type { EvidenceSubmission } from "@/types/moderation";

const evidenceLabels = { photo: "Foto (PNG, JPEG)", pdf: "PDF", link: "Link", text: "Texto" } as const;

export const moderationService = {
    async all(): Promise<EvidenceSubmission[]> {
        return (await history("/admin/submissions")).map((item) => ({
            id: item.id, missionId: item.missionId, missionTitle: item.missionTitle,
            collaborator: { id: item.collaboratorEmail, name: item.collaboratorName, initials: item.collaboratorName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") },
            evidenceType: evidenceLabels[item.evidenceType], fileName: item.originalFileName ?? item.evidenceValue ?? "Evidência registrada",
            submittedAt: item.submittedAt, status: item.status === "active" ? "Ativa" : item.status === "cancelled" ? "Cancelada" : "Invalidada",
            reviewedAt: item.statusChangedAt ?? undefined, justification: item.invalidationJustification ?? undefined,
            phase: item.evidencePhase ?? undefined,
        }));
    },
    async getById(id: string): Promise<EvidenceSubmission | null> {
        const evidence = (await this.all()).find((item) => item.id === id) ?? null;
        if (evidence && evidence.phase && ["Foto (PNG, JPEG)", "PDF"].includes(evidence.evidenceType)) {
            evidence.previewUrl = await muralService.download(id, evidence.phase);
        }
        return evidence;
    },
    async invalidate(id: string, justification: string): Promise<void> {
        return api<void>(`/admin/submissions/${id}/invalidate`, { method: "POST", body: JSON.stringify({ justification }) });
    },
};
