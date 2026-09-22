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
        isCheckin: mission.isCheckin,
        checkinMonth: mission.isCheckin ? mission.startDate.slice(0, 7) : "",
        allowsMultipleSubmissions: mission.allowsMultipleSubmissions,
        phaseDrafts: mission.phases.map((phase) => ({ title: phase.title, xp: String(phase.xpReward) })),
        status: mission.status === "active" ? "Ativa" : "Invalidada",
        hasProgress: mission.hasSubmissions,
        updatedAt: "",
        phases: mission.phases,
    };
}

export function checkinDateRange(month: string): { startDate: string; endDate: string } {
    const [year, number] = month.split("-").map(Number);
    const lastDay = new Date(Date.UTC(year, number, 0)).getUTCDate();
    return { startDate: `${month}-01`, endDate: `${month}-${String(lastDay).padStart(2, "0")}` };
}

export function missionRequest(data: MissionFormData): MissionRequest {
    const dates = data.isCheckin ? checkinDateRange(data.checkinMonth) : { startDate: data.startDate, endDate: data.endDate };
    return {
        title: data.title.trim(), description: data.description.trim(),
        evidenceType: evidenceToApi[data.evidenceType as keyof typeof evidenceToApi],
        ...dates,
        recurrenceType: data.isCheckin ? "monthly" : data.recurrenceType,
        weekdays: !data.isCheckin && data.recurrenceType === "weekly" ? data.recurrenceDays : [],
        isCheckin: data.isCheckin,
        allowsMultipleSubmissions: data.allowsMultipleSubmissions,
        phases: data.phaseDrafts.map((phase, index) => ({ number: index + 1, title: phase.title.trim(), xpReward: Number(phase.xp) })),
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
        return toUiMission(await api<ApiMission>("/missions", { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: JSON.stringify(missionRequest(data)) }));
    },
    async update(id: string, data: MissionFormData): Promise<Mission> {
        return toUiMission(await api<ApiMission>(`/missions/${id}`, { method: "PATCH", body: JSON.stringify(missionRequest(data)) }));
    },
    invalidate(id: string): Promise<void> {
        return api<void>(`/missions/${id}/invalidate`, { method: "POST" });
    },
};
