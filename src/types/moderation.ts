export type Collaborator = { id: string; name: string; initials: string };
export type EvidenceStatus = "Pendente" | "Aprovada" | "Recusada";
export type EvidenceSubmission = {
    id: string;
    missionId: string;
    missionTitle: string;
    collaborator: Collaborator;
    evidenceType: "Foto (PNG, JPEG)" | "PDF";
    fileName: string;
    /** URL temporária ou definitiva retornada pelo envio da imagem. */
    previewUrl?: string;
    submittedAt: string;
    status: EvidenceStatus;
    reviewedAt?: string;
    justification?: string;
};
export type EvidenceQueueFilters = { userId?: string; missionId?: string; collaboratorQuery?: string };
