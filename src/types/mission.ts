export const EVIDENCE_TYPES = ["Foto (PNG, JPEG)", "PDF"] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];
export type MissionStatus = "Rascunho" | "Publicada";

export type MissionFormData = {
    title: string;
    description: string;
    evidenceType: EvidenceType | "";
    xp: string;
    startDate: string;
    endDate: string;
};

export type Mission = MissionFormData & {
    id: string;
    status: MissionStatus;
    hasProgress: boolean;
    updatedAt: string;
};
