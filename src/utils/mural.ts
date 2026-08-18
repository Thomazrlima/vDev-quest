import type { EvidenceInput, MuralFilter, MuralMission, MuralSubmission } from "@/types/mission";

/** O prazo só vira alerta enquanto a entrega ainda depende do colaborador. */
export const URGENT_THRESHOLD_IN_DAYS = 3;

/** Teto do anexo, o mesmo que a BE-06 aceitará no multipart. */
export const MAX_EVIDENCE_SIZE_IN_MB = 10;

/** Da entrega mais recente para a mais antiga: é assim que o histórico é lido na tela. */
export function byNewest(submissions: MuralSubmission[]) {
    return [...submissions].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function pendingSubmission(mission: MuralMission) {
    return mission.submissions.find((submission) => submission.status === "pendente") ?? null;
}

export function approvedSubmission(mission: MuralMission) {
    return mission.submissions.find((submission) => submission.status === "aprovada") ?? null;
}

/**
 * A recusa só vira alerta quando é a última palavra do gestor. Se depois dela veio outra
 * entrega, ela virou histórico e fica na tabela de submissões, não no topo da tela.
 */
export function openRefusal(mission: MuralMission) {
    const [latest] = mission.submissions;
    return latest?.status === "recusada" ? latest : null;
}

/**
 * A aba do mural sai das submissões: aprovada encerra a missão, pendente a deixa em análise e
 * o resto — sem entrega ou só com recusas — a devolve para as disponíveis.
 */
export function muralStateOf(mission: MuralMission): MuralFilter {
    if (approvedSubmission(mission)) return "concluidas";
    if (pendingSubmission(mission)) return "aguardando";
    return "disponiveis";
}

/** Uma entrega por vez: enquanto o gestor não responde, ou depois que aprovou, o formulário sai. */
export function acceptsEvidence(mission: MuralMission) {
    return muralStateOf(mission) === "disponiveis";
}

export function deadlineLabel(remainingDays: number) {
    if (remainingDays < 0) return "Prazo encerrado";
    if (remainingDays === 0) return "Encerra hoje";
    if (remainingDays === 1) return "Encerra amanhã";
    return `Encerra em ${remainingDays} dias`;
}

/** Com a entrega em análise ou aprovada o prazo é só histórico: não há o que correr atrás. */
export function isDeadlineUrgent(state: MuralFilter, remainingDays: number) {
    return state === "disponiveis" && remainingDays <= URGENT_THRESHOLD_IN_DAYS;
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
