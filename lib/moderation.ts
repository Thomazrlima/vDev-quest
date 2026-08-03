export type Moderator = {
  id: string;
  name: string;
  initials: string;
};

export type EvidenceStatus = "Pendente";

export type EvidenceSubmission = {
  id: string;
  missionId: string;
  missionTitle: string;
  collaborator: Moderator;
  evidenceType: "Foto (PNG, JPEG)" | "PDF";
  fileName: string;
  submittedAt: string;
  status: EvidenceStatus;
};

export type EvidenceQueueFilters = {
  userId?: string;
  missionId?: string;
  collaboratorQuery?: string;
};

const submissions: EvidenceSubmission[] = [
  { id: "ev-001", missionId: "clean-code", missionTitle: "Código limpo, guilda forte", collaborator: { id: "ana-costa", name: "Ana Costa", initials: "AC" }, evidenceType: "PDF", fileName: "refatoracao-checklist.pdf", submittedAt: "2026-07-29T08:16:00.000Z", status: "Pendente" },
  { id: "ev-002", missionId: "sprint-em-andamento", missionTitle: "Sprint dos guardiões", collaborator: { id: "bruno-lima", name: "Bruno Lima", initials: "BL" }, evidenceType: "Foto (PNG, JPEG)", fileName: "sprint-entrega.png", submittedAt: "2026-07-29T11:42:00.000Z", status: "Pendente" },
  { id: "ev-003", missionId: "clean-code", missionTitle: "Código limpo, guilda forte", collaborator: { id: "carla-souza", name: "Carla Souza", initials: "CS" }, evidenceType: "PDF", fileName: "padrao-de-codigo.pdf", submittedAt: "2026-07-30T14:08:00.000Z", status: "Pendente" },
  { id: "ev-004", missionId: "sprint-em-andamento", missionTitle: "Sprint dos guardiões", collaborator: { id: "ana-costa", name: "Ana Costa", initials: "AC" }, evidenceType: "Foto (PNG, JPEG)", fileName: "retrospectiva-time.jpeg", submittedAt: "2026-07-31T09:31:00.000Z", status: "Pendente" },
  { id: "ev-005", missionId: "clean-code", missionTitle: "Código limpo, guilda forte", collaborator: { id: "diego-alves", name: "Diego Alves", initials: "DA" }, evidenceType: "PDF", fileName: "clean-code-entrega.pdf", submittedAt: "2026-08-01T16:22:00.000Z", status: "Pendente" }
];

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(data), 300));
}

/** Mock da API BE-02. O objeto filters representa query params de uma requisição GET. */
export async function getEvidenceQueue(filters: EvidenceQueueFilters = {}): Promise<EvidenceSubmission[]> {
  const query = filters.collaboratorQuery?.trim().toLocaleLowerCase("pt-BR");
  const filtered = submissions
    .filter((submission) => !filters.missionId || submission.missionId === filters.missionId)
    .filter((submission) => !filters.userId || submission.collaborator.id === filters.userId)
    .filter((submission) => !query || submission.collaborator.name.toLocaleLowerCase("pt-BR").includes(query))
    .sort((left, right) => new Date(left.submittedAt).getTime() - new Date(right.submittedAt).getTime());

  return delay(filtered);
}

export async function getEvidenceById(id: string): Promise<EvidenceSubmission | null> {
  return delay(submissions.find((submission) => submission.id === id) ?? null);
}

export function getModerationCollaborators(): Moderator[] {
  return [...new Map(submissions.map((submission) => [submission.collaborator.id, submission.collaborator])).values()];
}

export function getModerationMissions() {
  return [...new Map(submissions.map((submission) => [submission.missionId, { id: submission.missionId, title: submission.missionTitle }])).values()];
}
