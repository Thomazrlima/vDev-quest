import { EVIDENCE_SUBMISSIONS } from "@/mocks/data/evidence-submissions";
import type { EvidenceQueueFilters, EvidenceStatus, EvidenceSubmission } from "@/types/moderation";

const STORAGE_KEY = "vdev-quest-evidence-reviews";

type StoredReview = Pick<EvidenceSubmission, "status" | "reviewedAt" | "justification">;

function mockResponse<T>(data: T): Promise<T> {
    return new Promise((resolve) => window.setTimeout(() => resolve(data), 300));
}

function readStored(): Record<string, StoredReview> {
    if (typeof window === "undefined") return {};
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    try {
        return JSON.parse(stored) as Record<string, StoredReview>;
    } catch {
        return {};
    }
}

function saveStored(reviews: Record<string, StoredReview>) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function read(): EvidenceSubmission[] {
    const reviews = readStored();
    return EVIDENCE_SUBMISSIONS.map((evidence) => ({ ...evidence, ...reviews[evidence.id] }));
}

function review(id: string, status: Exclude<EvidenceStatus, "Pendente">, justification?: string): Promise<EvidenceSubmission> {
    const evidence = read().find((item) => item.id === id);
    if (!evidence) return Promise.reject(new Error("Evidência não encontrada."));
    if (evidence.status !== "Pendente") return Promise.reject(new Error("Esta evidência já foi avaliada."));

    const reviews = readStored();
    const reviewed: EvidenceSubmission = { ...evidence, status, reviewedAt: new Date().toISOString(), ...(justification ? { justification } : {}) };
    saveStored({ ...reviews, [id]: { status: reviewed.status, reviewedAt: reviewed.reviewedAt, justification: reviewed.justification } });
    return mockResponse(reviewed);
}

export const moderationService = {
    list(filters: EvidenceQueueFilters = {}) {
        const query = filters.collaboratorQuery?.trim().toLocaleLowerCase("pt-BR");
        const result = read()
            .filter((item) => item.status === "Pendente")
            .filter((item) => !filters.missionId || item.missionId === filters.missionId)
            .filter((item) => !filters.userId || item.collaborator.id === filters.userId)
            .filter((item) => !query || item.collaborator.name.toLocaleLowerCase("pt-BR").includes(query))
            .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
        return mockResponse(result);
    },
    history(filters: EvidenceQueueFilters = {}) {
        const query = filters.collaboratorQuery?.trim().toLocaleLowerCase("pt-BR");
        const result = read()
            .filter((item) => item.status !== "Pendente")
            .filter((item) => !filters.missionId || item.missionId === filters.missionId)
            .filter((item) => !filters.userId || item.collaborator.id === filters.userId)
            .filter((item) => !query || item.collaborator.name.toLocaleLowerCase("pt-BR").includes(query))
            .sort((a, b) => new Date(b.reviewedAt ?? 0).getTime() - new Date(a.reviewedAt ?? 0).getTime());
        return mockResponse(result);
    },
    getById: (id: string) => mockResponse(read().find((item) => item.id === id) ?? null),
    approve: (id: string) => review(id, "Aprovada"),
    reject: (id: string, justification: string) => review(id, "Recusada", justification.trim()),
    collaborators: () => [...new Map(read().map((item) => [item.collaborator.id, item.collaborator])).values()],
    missions: () => [...new Map(read().map((item) => [item.missionId, { id: item.missionId, title: item.missionTitle }])).values()],
};
