export const EVIDENCE_TYPES = ["Foto (PNG, JPEG)", "PDF"] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export type MissionStatus = "Rascunho" | "Publicada";

export type MissionFormData = {
  title: string;
  description: string;
  evidenceType: EvidenceType | "";
  xp: string;
  startDate: string;
  endDate: string;
};

export type Mission = MissionFormData & {
  id: string;
  status: MissionStatus;
  hasProgress: boolean;
  updatedAt: string;
};

const initialMissions: Mission[] = [
  {
    id: "clean-code",
    title: "Código limpo, guilda forte",
    description: "Revise uma entrega recente, aplique boas práticas de legibilidade e envie as evidências da melhoria.",
    evidenceType: "PDF",
    xp: "500",
    startDate: "2026-08-04",
    endDate: "2026-08-18",
    status: "Publicada",
    hasProgress: false,
    updatedAt: "Hoje, 09:30"
  },
  {
    id: "sprint-em-andamento",
    title: "Sprint dos guardiões",
    description: "Participe da sprint e registre as entregas concluídas pela sua equipe.",
    evidenceType: "Foto (PNG, JPEG)",
    xp: "800",
    startDate: "2026-07-28",
    endDate: "2026-08-12",
    status: "Publicada",
    hasProgress: true,
    updatedAt: "28 jul., 14:10"
  }
];

const STORAGE_KEY = "vdev-quest-missions";

function getStoredMissions(): Mission[] {
  if (typeof window === "undefined") return initialMissions;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return initialMissions;

  try {
    return JSON.parse(stored) as Mission[];
  } catch {
    return initialMissions;
  }
}

function persist(missions: Mission[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
}

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(data), 350));
}

/** Mock da API BE-01. Troque estas funções pelas chamadas HTTP quando o BE estiver disponível. */
export async function getMissions(): Promise<Mission[]> {
  return delay(getStoredMissions());
}

export async function getMissionById(id: string): Promise<Mission | null> {
  return delay(getStoredMissions().find((mission) => mission.id === id) ?? null);
}

export async function createMission(data: MissionFormData): Promise<Mission> {
  const mission: Mission = {
    ...data,
    id: `missao-${Date.now()}`,
    status: "Publicada",
    hasProgress: false,
    updatedAt: "Agora"
  };
  const missions = [mission, ...getStoredMissions()];
  persist(missions);
  return delay(mission);
}

export async function updateMission(id: string, data: MissionFormData): Promise<Mission> {
  const missions = getStoredMissions();
  const index = missions.findIndex((mission) => mission.id === id);
  if (index === -1) throw new Error("Missão não encontrada.");
  if (missions[index].hasProgress) throw new Error("Não é possível editar missões que já possuem progresso.");

  const updated: Mission = { ...missions[index], ...data, status: "Publicada", updatedAt: "Agora" };
  missions[index] = updated;
  persist(missions);
  return delay(updated);
}
