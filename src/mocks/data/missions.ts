import type { Mission } from "@/types/mission";

export const INITIAL_MISSIONS: Mission[] = [
    { id: "clean-code", title: "Código limpo, guilda forte", description: "Revise uma entrega recente, aplique boas práticas de legibilidade e envie as evidências da melhoria.", evidenceType: "PDF", xp: "500", startDate: "2026-08-04", endDate: "2026-08-18", status: "Publicada", hasProgress: false, updatedAt: "Hoje, 09:30" },
    { id: "sprint-em-andamento", title: "Sprint dos guardiões", description: "Participe da sprint e registre as entregas concluídas pela sua equipe.", evidenceType: "Foto (PNG, JPEG)", xp: "800", startDate: "2026-07-28", endDate: "2026-08-12", status: "Publicada", hasProgress: true, updatedAt: "28 jul., 14:10" },
];
