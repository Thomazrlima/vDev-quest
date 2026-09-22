export type EvidenceType = "photo" | "pdf" | "link" | "text";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";
export type Weekday = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
export type MissionPhase = { number: number; title: string; xpReward: number };
export type Mission = {
    id: string; slug: string; title: string; description: string; evidenceType: EvidenceType;
    startDate: string; endDate: string; recurrenceType: RecurrenceType; weekdays: Weekday[];
    isCheckin: boolean; allowsMultipleSubmissions: boolean; status: "active" | "invalidated";
    hasSubmissions: boolean; phases: MissionPhase[];
};
export type MissionRequest = Omit<Mission, "id" | "slug" | "status" | "hasSubmissions">;
export type MuralMission = {
    id: string; title: string; description: string; evidenceType: EvidenceType;
    status: "available" | "in_progress" | "completed"; submissionId: string | null;
    nextPhase: MissionPhase | null; occurrenceDate: string | null; isCheckin: boolean;
    allowsMultipleSubmissions: boolean;
    endDate: string; xpReward: number; phaseCount: number;
};
export type SubmissionHistory = {
    id: string; missionId: string; missionTitle: string; currentPhase: number; occurrenceDate: string | null;
    status: "active" | "cancelled" | "invalidated"; submittedAt: string; statusChangedAt: string | null;
    invalidationJustification: string | null; collaboratorName: string; collaboratorEmail: string; evidenceType: EvidenceType;
    evidenceValue: string | null; originalFileName: string | null; evidencePhase: number | null;
    missionDescription: string; missionEndDate: string; missionXp: number; missionPhaseCount: number;
    evidences: { phaseNumber: number; evidenceValue: string | null; originalFileName: string | null; submittedAt: string }[];
};
export type CursorPage<T> = { items: T[]; nextCursor: string | null };
export type Profile = {
    name: string; xp: number; role: "COLLABORATOR" | "MANAGER" | "collaborator" | "manager";
    level: number; levelLabel: string; progress: number | null; nextLevelXp: number | null;
    activeTitle: string | null; badges: { code: string; label: string; imagePath?: string | null }[];
};
export type RankingEntry = {
    position: number; name: string; xp: number; completedMissions: number; level: number;
    levelLabel: string; activeTitle: string | null; badges: Profile["badges"];
    avatar: { bodyType: "hero" | "heroine"; skinColorIndex: number; slots: { slot: string; code: string | null; colorIndex: number }[] };
};
