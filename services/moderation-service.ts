import { EVIDENCE_SUBMISSIONS } from "@/data/moderation-mocks";
import type { EvidenceQueueFilters } from "@/types/moderation";

function mockResponse<T>(data: T): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(data), 300));
}

export const moderationService = {
  list(filters: EvidenceQueueFilters = {}) {
    const query = filters.collaboratorQuery?.trim().toLocaleLowerCase("pt-BR");
    const result = EVIDENCE_SUBMISSIONS
      .filter((item) => !filters.missionId || item.missionId === filters.missionId)
      .filter((item) => !filters.userId || item.collaborator.id === filters.userId)
      .filter((item) => !query || item.collaborator.name.toLocaleLowerCase("pt-BR").includes(query))
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    return mockResponse(result);
  },
  getById: (id: string) => mockResponse(EVIDENCE_SUBMISSIONS.find((item) => item.id === id) ?? null),
  collaborators: () => [...new Map(EVIDENCE_SUBMISSIONS.map((item) => [item.collaborator.id, item.collaborator])).values()],
  missions: () => [...new Map(EVIDENCE_SUBMISSIONS.map((item) => [item.missionId, { id: item.missionId, title: item.missionTitle }])).values()]
};
