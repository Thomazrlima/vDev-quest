import { MURAL_MISSIONS } from "@/mocks/data/mural";
import type { MuralFilter, MuralMission } from "@/types/mission";

/** O mesmo atraso simulado dos outros serviços, para o skeleton do mural aparecer. */
function mockResponse<T>(data: T): Promise<T> {
    return new Promise((resolve) => window.setTimeout(() => resolve(data), 450));
}

export const muralService = {
    /** BE-05 responderá por status; aqui o filtro é aplicado sobre as fichas de exemplo. */
    list: (state: MuralFilter): Promise<MuralMission[]> => mockResponse(MURAL_MISSIONS.filter((mission) => mission.state === state)),
};
