export const EVIDENCE_TYPES = ["Foto (PNG, JPEG)", "PDF", "Link", "Texto"] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];
export type MissionStatus = "Rascunho" | "Publicada";

export const RECURRENCE_TYPES = ["none", "daily", "weekly", "monthly"] as const;
export type RecurrenceType = (typeof RECURRENCE_TYPES)[number];

export const RECURRENCE_TYPE_LABELS: Record<RecurrenceType, string> = {
    none: "Não se repete",
    daily: "Diariamente",
    weekly: "Semanalmente",
    monthly: "Mensalmente",
};

export const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
    monday: "Segunda",
    tuesday: "Terça",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    saturday: "Sábado",
    sunday: "Domingo",
};

/** Como a evidência é preenchida na tela de envio: anexo, endereço ou relato escrito. */
export type EvidenceInputKind = "file" | "link" | "text";

export type EvidenceInput = { kind: "file"; accept: string; extensions: string[] } | { kind: "link" } | { kind: "text" };

/** O tipo pedido pelo gestor decide qual campo a FE-06 mostra ao colaborador. */
export const EVIDENCE_INPUTS: Record<EvidenceType, EvidenceInput> = {
    "Foto (PNG, JPEG)": { kind: "file", accept: "image/png,image/jpeg", extensions: [".png", ".jpg", ".jpeg"] },
    PDF: { kind: "file", accept: "application/pdf", extensions: [".pdf"] },
    Link: { kind: "link" },
    Texto: { kind: "text" },
};

export type MissionFormData = {
    title: string;
    description: string;
    evidenceType: EvidenceType | "";
    xp: string;
    startDate: string;
    endDate: string;
    recurrenceType: RecurrenceType;
    recurrenceDays: Weekday[];
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
    { value: "recusadas", label: "Recusadas" },
    { value: "concluidas", label: "Concluídas" },
] as const;

export type MuralFilter = (typeof MURAL_FILTERS)[number]["value"];

/** O veredito de uma entrega. Quem é aprovado ou recusado é a submissão, nunca a missão. */
export const SUBMISSION_STATUSES = ["pendente", "aprovada", "recusada"] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

/** O nome de cada veredito, o mesmo no selo da submissão e no filtro do feed. */
export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
    pendente: "Em análise",
    aprovada: "Aprovada",
    recusada: "Recusada",
};

/** Uma entrega do colaborador: o nome do arquivo anexado, o endereço colado ou o relato escrito. */
export type MuralSubmission = {
    id: string;
    kind: EvidenceInputKind;
    value: string;
    submittedAt: string;
    status: SubmissionStatus;
    /** A miniatura da foto entregue, quando a evidência é uma imagem; é ela que o feed do perfil mostra. */
    preview?: string;
    /** O que o gestor escreveu ao recusar esta entrega; só existe nas recusadas. */
    justification?: string;
    /** Quando o veredito saiu, para o histórico contar a ordem dos acontecimentos. */
    reviewedAt?: string;
};

/** Uma missão como o colaborador a vê: sem os campos de gestão, com prazo e suas entregas. */
export type MuralMission = {
    id: string;
    title: string;
    description: string;
    evidenceType: EvidenceType;
    xp: string;
    deadline: string;
    /** O histórico do colaborador nesta missão, da entrega mais recente para a mais antiga. */
    submissions: MuralSubmission[];
};

/** Uma entrega no feed do perfil: a submissão junto da missão de onde ela saiu. */
export type FeedEntry = {
    mission: MuralMission;
    submission: MuralSubmission;
};

/** O recorte do feed. Campo vazio é "todas": é assim que o filtro dá meia-volta. */
export type FeedFilters = {
    missionId: string;
    status: SubmissionStatus | "";
};
