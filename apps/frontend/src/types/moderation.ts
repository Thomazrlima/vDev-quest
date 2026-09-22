export type Collaborator = { id: string; name: string; initials: string };
export type EvidenceStatus = "Ativa" | "Cancelada" | "Invalidada";
export type EvidenceSubmission = {
    id: string;
    missionId: string;
    missionTitle: string;
    collaborator: Collaborator;
    evidenceType: "Foto (PNG, JPEG)" | "PDF" | "Link" | "Texto";
    fileName: string;
    /** URL temporária ou definitiva retornada pelo envio da imagem. */
    previewUrl?: string;
    submittedAt: string;
    status: EvidenceStatus;
    reviewedAt?: string;
    justification?: string;
    phase?: number;
};
export type EvidenceQueueFilters = { userId?: string; missionId?: string; collaboratorQuery?: string };
