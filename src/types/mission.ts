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

/** As abas do mural do colaborador, na ordem em que aparecem na tela. */
export const MURAL_FILTERS = [
    { value: "disponiveis", label: "Disponíveis" },
    { value: "aguardando", label: "Aguardando Aprovação" },
    { value: "concluidas", label: "Concluídas" },
] as const;

export type MuralFilter = (typeof MURAL_FILTERS)[number]["value"];

/** Uma missão como o colaborador a vê: sem os campos de gestão, com prazo e estado dele. */
export type MuralMission = {
    id: string;
    title: string;
    description: string;
    evidenceType: EvidenceType;
    xp: string;
    deadline: string;
    state: MuralFilter;
};
