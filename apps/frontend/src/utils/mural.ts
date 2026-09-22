import type { EvidenceInput, FeedEntry, FeedFilters, MuralFilter, MuralMission, MuralSubmission } from "@/types/mission";

/** O prazo só vira alerta enquanto a entrega ainda depende do colaborador. */
export const URGENT_THRESHOLD_IN_DAYS = 3;

/** Teto do anexo, o mesmo que a BE-06 aceitará no multipart. */
export const MAX_EVIDENCE_SIZE_IN_MB = 3;

/** Da entrega mais recente para a mais antiga: é assim que o histórico é lido na tela. */
export function byNewest(submissions: MuralSubmission[]) {
    return [...submissions].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function pendingSubmission(mission: MuralMission) {
    return mission.state === "aguardando" ? mission.submissions.find((submission) => submission.status === "ativa") ?? null : null;
}

export function approvedSubmission(mission: MuralMission) {
    return mission.state === "concluidas" ? mission.submissions.find((submission) => submission.status === "ativa") ?? null : null;
}

/** Destaca a última invalidação no histórico da missão. */
export function openRefusal(mission: MuralMission) {
    const [latest] = mission.submissions;
    return latest?.status === "invalidada" ? latest : null;
}

/** A API calcula o estado atual de cada missão. */
export function muralStateOf(mission: MuralMission): MuralFilter {
    return mission.state;
}

/** A API informa se existe uma próxima fase ou nova ocorrência disponível. */
export function acceptsEvidence(mission: MuralMission) {
    return mission.canSubmit;
}

/** O feed do perfil é o histórico inteiro do colaborador: toda entrega, da mais nova para a mais antiga. */
export function submissionFeed(missions: MuralMission[]): FeedEntry[] {
    const entries = missions.flatMap((mission) => mission.submissions.map((submission) => ({ mission, submission })));
    return entries.sort((a, b) => new Date(b.submission.submittedAt).getTime() - new Date(a.submission.submittedAt).getTime());
}

/**
 * O recorte do feed. Quando a BE-05 existir, missão e status virarão parâmetros da consulta;
 * aqui o histórico já está em mãos, então filtrar é imediato e o mosaico não pisca.
 */
export function filterFeed(entries: FeedEntry[], { missionId, status }: FeedFilters) {
    return entries.filter((entry) => (!missionId || entry.mission.id === missionId) && (!status || entry.submission.status === status));
}

/** O filtro só oferece missões que o colaborador já entregou — as outras não têm o que mostrar. */
export function feedMissions(entries: FeedEntry[]) {
    const missions = new Map(entries.map(({ mission }) => [mission.id, mission]));
    return [...missions.values()].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
}

export function deadlineLabel(remainingDays: number) {
    if (remainingDays < 0) return "Prazo encerrado";
    if (remainingDays === 0) return "Encerra hoje";
    if (remainingDays === 1) return "Encerra amanhã";
    return `Encerra em ${remainingDays} dias`;
}

/** O prazo só é urgente quando ainda há uma ação disponível. */
export function isDeadlineUrgent(state: MuralFilter, remainingDays: number) {
    return (state === "disponiveis" || state === "recusadas") && remainingDays <= URGENT_THRESHOLD_IN_DAYS;
}

/** [".png", ".jpg"] vira "PNG ou JPG" — o formato como o colaborador lê no campo. */
export function formatExtensions(extensions: string[]) {
    const names = extensions.map((extension) => extension.replace(".", "").toUpperCase());
    if (names.length < 2) return names.join("");
    return `${names.slice(0, -1).join(", ")} ou ${names.at(-1)}`;
}

export function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

/**
 * Recusa o anexo antes do envio: o navegador aceita qualquer arquivo arrastado, mesmo fora do
 * `accept` do input, e o gestor não conseguiria abrir um formato que ele não pediu.
 */
export function validateEvidenceFile(file: File, input: Extract<EvidenceInput, { kind: "file" }>) {
    const acceptedType = input.accept.split(",").includes(file.type);
    const acceptedExtension = input.extensions.some((extension) => file.name.toLowerCase().endsWith(extension));
    if (!acceptedType && !acceptedExtension) return `Formato não aceito: esta missão pede ${formatExtensions(input.extensions)}.`;
    if (file.size > MAX_EVIDENCE_SIZE_IN_MB * 1024 * 1024) return `O arquivo passa de ${MAX_EVIDENCE_SIZE_IN_MB} MB. Envie uma versão mais leve.`;
    return null;
}

/** Só http(s): um caminho da máquina do colaborador o gestor não teria como abrir. */
export function isEvidenceLink(value: string) {
    try {
        const { protocol } = new URL(value.trim());
        return protocol === "http:" || protocol === "https:";
    } catch {
        return false;
    }
}
