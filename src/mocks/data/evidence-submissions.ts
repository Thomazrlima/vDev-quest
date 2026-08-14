import type { EvidenceSubmission } from "@/types/moderation";

export const EVIDENCE_SUBMISSIONS: EvidenceSubmission[] = [
    { id: "ev-001", missionId: "clean-code", missionTitle: "Código limpo, guilda forte", collaborator: { id: "ana-costa", name: "Ana Costa", initials: "AC" }, evidenceType: "PDF", fileName: "refatoracao-checklist.pdf", submittedAt: "2026-07-29T08:16:00.000Z", status: "Pendente" },
    { id: "ev-002", missionId: "sprint-em-andamento", missionTitle: "Sprint dos guardiões", collaborator: { id: "bruno-lima", name: "Bruno Lima", initials: "BL" }, evidenceType: "Foto (PNG, JPEG)", fileName: "sprint-entrega.png", submittedAt: "2026-07-29T11:42:00.000Z", status: "Pendente" },
    { id: "ev-003", missionId: "clean-code", missionTitle: "Código limpo, guilda forte", collaborator: { id: "carla-souza", name: "Carla Souza", initials: "CS" }, evidenceType: "PDF", fileName: "padrao-de-codigo.pdf", submittedAt: "2026-07-30T14:08:00.000Z", status: "Pendente" },
    { id: "ev-004", missionId: "sprint-em-andamento", missionTitle: "Sprint dos guardiões", collaborator: { id: "ana-costa", name: "Ana Costa", initials: "AC" }, evidenceType: "Foto (PNG, JPEG)", fileName: "retrospectiva-time.jpeg", submittedAt: "2026-07-31T09:31:00.000Z", status: "Pendente" },
    { id: "ev-005", missionId: "clean-code", missionTitle: "Código limpo, guilda forte", collaborator: { id: "diego-alves", name: "Diego Alves", initials: "DA" }, evidenceType: "PDF", fileName: "clean-code-entrega.pdf", submittedAt: "2026-08-01T16:22:00.000Z", status: "Pendente" },
];
