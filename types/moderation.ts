export type Collaborator = { id: string; name: string; initials: string };
export type EvidenceStatus = "Pendente";
export type EvidenceSubmission = {
  id: string;
  missionId: string;
  missionTitle: string;
  collaborator: Collaborator;
  evidenceType: "Foto (PNG, JPEG)" | "PDF";
  fileName: string;
  submittedAt: string;
  status: EvidenceStatus;
};
export type EvidenceQueueFilters = { userId?: string; missionId?: string; collaboratorQuery?: string };
