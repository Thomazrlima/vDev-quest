import { api, mutationKey } from "@/api/client";
import type { CursorPage, Mission as ApiMission, MuralMission as ApiMuralMission, SubmissionHistory } from "@/api/types";
import type { EvidenceType, FeedEntry, MuralFilter, MuralMission, MuralSubmission } from "@/types/mission";
import { byNewest, submissionFeed } from "@/utils/mural";

const evidenceFromApi = { photo: "Foto (PNG, JPEG)", pdf: "PDF", link: "Link", text: "Texto" } as const satisfies Record<string, EvidenceType>;

export async function history(endpoint: "/me/submissions" | "/admin/submissions"): Promise<SubmissionHistory[]> {
    const items: SubmissionHistory[] = [];
    let cursor: string | null = null;
    do {
        const page: CursorPage<SubmissionHistory> = await api(`${endpoint}?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
        items.push(...page.items);
        cursor = page.nextCursor;
    } while (cursor);
    return items;
}

function submission(item: SubmissionHistory): MuralSubmission {
    return {
        id: item.id, kind: item.originalFileName ? "file" : item.evidenceType === "link" ? "link" : "text",
        value: item.originalFileName ?? item.evidenceValue ?? "Evidência registrada",
        submittedAt: item.submittedAt, status: item.status === "active" ? "ativa" : item.status === "cancelled" ? "cancelada" : "invalidada",
        justification: item.invalidationJustification ?? undefined,
        reviewedAt: item.statusChangedAt ?? undefined,
        phase: item.currentPhase, downloadPhase: item.originalFileName ? item.evidencePhase ?? undefined : undefined,
        evidences: item.evidences?.map((phase) => ({
            phaseNumber: phase.phaseNumber,
            kind: phase.originalFileName ? "file" : item.evidenceType === "link" ? "link" : "text",
            value: phase.originalFileName ?? phase.evidenceValue ?? "Evidência registrada",
            submittedAt: phase.submittedAt,
        })),
    };
}

function fromMural(item: ApiMuralMission, records: SubmissionHistory[]): MuralMission {
    const mine = records.filter((record) => record.missionId === item.id);
    const state: MuralFilter = item.status === "completed" ? "concluidas" : item.status === "in_progress" ? "aguardando" : "disponiveis";
    return {
        id: item.id, title: item.title, description: item.description, evidenceType: evidenceFromApi[item.evidenceType],
        xp: String(item.nextPhase?.xpReward ?? item.xpReward), deadline: item.endDate,
        submissions: byNewest(mine.map(submission)), state, canSubmit: state !== "concluidas" || item.allowsMultipleSubmissions,
        submissionId: item.submissionId, occurrenceDate: item.occurrenceDate, phaseCount: item.phaseCount,
        nextPhaseTitle: item.nextPhase?.title, isCheckin: item.isCheckin, allowsMultipleSubmissions: item.allowsMultipleSubmissions,
    };
}

function fromHistory(item: SubmissionHistory, records: SubmissionHistory[]): MuralMission {
    const mine = records.filter((record) => record.missionId === item.missionId);
    return {
        id: item.missionId, title: item.missionTitle, description: item.missionDescription,
        evidenceType: evidenceFromApi[item.evidenceType], xp: String(item.missionXp), deadline: item.missionEndDate,
        submissions: byNewest(mine.map(submission)), state: item.status === "active" ? (item.currentPhase >= item.missionPhaseCount ? "concluidas" : "aguardando") : "recusadas",
        canSubmit: false, submissionId: null, occurrenceDate: item.occurrenceDate, phaseCount: item.missionPhaseCount,
        isCheckin: false, allowsMultipleSubmissions: false,
    };
}

async function readMural(): Promise<MuralMission[]> {
    const [current, records] = await Promise.all([api<ApiMuralMission[]>("/mural"), history("/me/submissions")]);
    const missions = current.map((item) => fromMural(item, records));
    const currentIds = new Set(current.map((item) => item.id));
    const historical = new Map<string, SubmissionHistory>();
    for (const record of records) if (!currentIds.has(record.missionId) && !historical.has(record.missionId)) historical.set(record.missionId, record);
    return [...missions, ...[...historical.values()].map((item) => fromHistory(item, records))];
}

export const muralService = {
    all: readMural,
    async list(state: MuralFilter): Promise<MuralMission[]> {
        const missions = await readMural();
        if (state === "recusadas") return missions.filter((mission) => mission.submissions.some((item) => item.status !== "ativa"));
        return missions.filter((mission) => mission.state === state);
    },
    async getById(id: string): Promise<MuralMission | null> {
        const [missions, records] = await Promise.all([api<ApiMuralMission[]>("/mural"), history("/me/submissions")]);
        const current = missions.find((item) => item.id === id);
        if (current) return fromMural(current, records);
        const item = records.find((record) => record.missionId === id);
        if (item) return fromHistory(item, records);
        try {
            const mission = await api<ApiMission>(`/missions/${id}`);
            return {
                id, title: mission.title, description: mission.description, evidenceType: evidenceFromApi[mission.evidenceType],
                xp: String(mission.phases.reduce((total, phase) => total + phase.xpReward, 0)), deadline: mission.endDate,
                submissions: [], state: "disponiveis", canSubmit: false, submissionId: null, occurrenceDate: null,
                phaseCount: mission.phases.length, isCheckin: mission.isCheckin, allowsMultipleSubmissions: mission.allowsMultipleSubmissions,
            };
        } catch { return null; }
    },
    async feed(): Promise<FeedEntry[]> {
        const records = await history("/me/submissions");
        const missions = new Map<string, MuralMission>();
        for (const item of records) if (!missions.has(item.missionId)) missions.set(item.missionId, fromHistory(item, records));
        return submissionFeed([...missions.values()]);
    },
    async submit(id: string, evidence: FormData, idempotencyKey = mutationKey(), submissionId?: string | null): Promise<MuralMission> {
        if (submissionId) evidence.set("submissionId", submissionId);
        await api(`/missions/${id}/submissions`, { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: evidence });
        return (await this.getById(id))!;
    },
    cancel(id: string): Promise<void> { return api<void>(`/submissions/${id}/cancel`, { method: "POST" }); },
    async download(id: string, phase: number): Promise<string> {
        return (await api<{ url: string }>(`/submissions/${id}/evidence/${phase}/download`)).url;
    },
};
