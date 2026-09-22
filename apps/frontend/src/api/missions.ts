import { api, mutationKey } from "@/api/client";
import type { Mission as ApiMission, MissionRequest } from "@/api/types";
import type { Mission, MissionFormData } from "@/types/mission";

const evidenceToApi = { "Foto (PNG, JPEG)": "photo", PDF: "pdf", Link: "link", Texto: "text" } as const;
const evidenceFromApi = { photo: "Foto (PNG, JPEG)", pdf: "PDF", link: "Link", text: "Texto" } as const;

export function toUiMission(mission: ApiMission): Mission {
    return {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        evidenceType: evidenceFromApi[mission.evidenceType],
        xp: String(mission.phases.reduce((sum, phase) => sum + phase.xpReward, 0)),
        startDate: mission.startDate,
        endDate: mission.endDate,
        recurrenceType: mission.recurrenceType,
        recurrenceDays: mission.weekdays,
        status: mission.status === "active" ? "Ativa" : "Invalidada",
        hasProgress: mission.hasSubmissions,
        updatedAt: "",
        phases: mission.phases,
    };
}

function request(data: MissionFormData, existing?: Mission): MissionRequest {
    const xp = Number(data.xp);
    return {
        title: data.title.trim(), description: data.description.trim(),
        evidenceType: evidenceToApi[data.evidenceType as keyof typeof evidenceToApi],
        startDate: data.startDate, endDate: data.endDate,
        recurrenceType: data.recurrenceType, weekdays: data.recurrenceType === "weekly" ? data.recurrenceDays : [],
        isCheckin: false, allowsMultipleSubmissions: false,
        phases: existing?.phases && existing.phases.length > 1
            ? existing.phases
            : [{ number: 1, title: "Conclusão", xpReward: xp }],
    };
}

export const missionService = {
    async list(): Promise<Mission[]> {
        return (await api<ApiMission[]>("/missions")).map(toUiMission);
    },
    async getById(id: string): Promise<Mission | null> {
        try { return toUiMission(await api<ApiMission>(`/missions/${id}`)); }
        catch (error) { if (error instanceof Error && "status" in error && error.status === 404) return null; throw error; }
    },
    async create(data: MissionFormData, idempotencyKey = mutationKey()): Promise<Mission> {
        return toUiMission(await api<ApiMission>("/missions", { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: JSON.stringify(request(data)) }));
    },
    async update(id: string, data: MissionFormData, existing?: Mission): Promise<Mission> {
        return toUiMission(await api<ApiMission>(`/missions/${id}`, { method: "PATCH", body: JSON.stringify(request(data, existing)) }));
    },
    invalidate(id: string): Promise<void> {
        return api<void>(`/missions/${id}/invalidate`, { method: "POST" });
    },
};
