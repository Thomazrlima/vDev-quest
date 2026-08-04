import { INITIAL_MISSIONS } from "@/data/mission-mocks";
import type { Mission, MissionFormData } from "@/types/mission";

const STORAGE_KEY = "vdev-quest-missions";

function read(): Mission[] {
  if (typeof window === "undefined") return INITIAL_MISSIONS;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_MISSIONS;
  try { return JSON.parse(stored) as Mission[]; } catch { return INITIAL_MISSIONS; }
}

function save(missions: Mission[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
}

function mockResponse<T>(data: T): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(data), 350));
}

export const missionService = {
  list: () => mockResponse(read()),
  getById: (id: string) => mockResponse(read().find((mission) => mission.id === id) ?? null),
  async create(data: MissionFormData) {
    const mission: Mission = { ...data, id: `missao-${Date.now()}`, status: "Publicada", hasProgress: false, updatedAt: "Agora" };
    save([mission, ...read()]);
    return mockResponse(mission);
  },
  async update(id: string, data: MissionFormData) {
    const missions = read();
    const index = missions.findIndex((mission) => mission.id === id);
    if (index === -1) throw new Error("Missão não encontrada.");
    if (missions[index].hasProgress) throw new Error("Não é possível editar missões que já possuem progresso.");
    const updated: Mission = { ...missions[index], ...data, status: "Publicada", updatedAt: "Agora" };
    missions[index] = updated;
    save(missions);
    return mockResponse(updated);
  }
};
