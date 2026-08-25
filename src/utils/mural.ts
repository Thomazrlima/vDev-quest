import type { EvidenceInput, FeedEntry, FeedFilters, MuralFilter, MuralMission, MuralSubmission } from "@/types/mission";

/** O prazo só vira alerta enquanto a entrega ainda depende do colaborador. */
export const URGENT_THRESHOLD_IN_DAYS = 3;

/** Teto do anexo, o mesmo que a BE-06 aceitará no multipart. */
export const MAX_EVIDENCE_SIZE_IN_MB = 10;

/** A largura da miniatura guardada: o bastante para o feed e leve o suficiente para o localStorage. */
const PREVIEW_SIZE_IN_PX = 480;

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
 * uma recusa aberta ganha sua própria seção para deixar claro que ela pede reenvio.
 */
export function muralStateOf(mission: MuralMission): MuralFilter {
    if (approvedSubmission(mission)) return "concluidas";
    if (pendingSubmission(mission)) return "aguardando";
    if (openRefusal(mission)) return "recusadas";
    return "disponiveis";
}

/** Uma entrega por vez: enquanto o gestor não responde, ou depois que aprovou, o formulário sai. */
export function acceptsEvidence(mission: MuralMission) {
    const state = muralStateOf(mission);
    return state === "disponiveis" || state === "recusadas";
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

/** No feed a foto é o post; as outras evidências viram um cartão com o que foi escrito ou anexado. */
export function isPhotoSubmission(submission: MuralSubmission) {
    return submission.kind === "file" && Boolean(submission.preview);
}

export function deadlineLabel(remainingDays: number) {
    if (remainingDays < 0) return "Prazo encerrado";
    if (remainingDays === 0) return "Encerra hoje";
    if (remainingDays === 1) return "Encerra amanhã";
    return `Encerra em ${remainingDays} dias`;
}

/** Com a entrega em análise ou aprovada o prazo é só histórico: não há o que correr atrás. */
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

/**
 * A foto entregue só existe no navegador de quem enviou, e o arquivo inteiro não cabe no
 * localStorage. Guardar uma miniatura reduzida deixa a entrega aparecer no feed do perfil
 * depois de recarregar a página, sem estourar a cota.
 */
export async function createEvidencePreview(file: File): Promise<string | null> {
    if (!file.type.startsWith("image/")) return null;

    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, PREVIEW_SIZE_IN_PX / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);

        const context = canvas.getContext("2d");
        if (!context) return null;

        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        return canvas.toDataURL("image/jpeg", 0.72);
    } catch {
        // Sem miniatura a entrega continua valendo: o feed mostra o cartão do anexo no lugar da foto.
        return null;
    }
}
