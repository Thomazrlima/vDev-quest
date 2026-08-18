import { MURAL_MISSIONS } from "@/mocks/data/mural";
import type { EvidenceInputKind, MuralFilter, MuralMission, MuralSubmission } from "@/types/mission";
import { acceptsEvidence, byNewest, muralStateOf } from "@/utils/mural";

const STORAGE_KEY = "vdev-quest-mural";

/** Guardar só o que o colaborador enviou deixa o histórico de exemplo continuar valendo. */
type StoredSubmissions = Record<string, MuralSubmission[]>;

/** O mesmo atraso simulado dos outros serviços, para o skeleton do mural aparecer. */
function mockResponse<T>(data: T, delay = 450): Promise<T> {
    return new Promise((resolve) => window.setTimeout(() => resolve(data), delay));
}

function readStored(): StoredSubmissions {
    if (typeof window === "undefined") return {};
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    try {
        return JSON.parse(stored) as StoredSubmissions;
    } catch {
        return {};
    }
}

function saveStored(submissions: StoredSubmissions) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

function read(): MuralMission[] {
    const stored = readStored();
    return MURAL_MISSIONS.map((mission) => ({ ...mission, submissions: byNewest([...mission.submissions, ...(stored[mission.id] ?? [])]) }));
}

/** O corpo que a BE-06 receberá: arquivo em multipart, endereço e relato como texto. */
function toSubmission(evidence: FormData): MuralSubmission {
    const file = evidence.get("file");
    const entry = { id: `sub-${Date.now()}`, submittedAt: new Date().toISOString(), status: "pendente" } as const;
    if (file instanceof File) return { ...entry, kind: "file", value: file.name };

    return { ...entry, kind: (evidence.get("kind") as EvidenceInputKind) ?? "text", value: String(evidence.get("value") ?? "").trim() };
}

export const muralService = {
    /** BE-05 responderá por status; aqui a aba sai do histórico de submissões de cada missão. */
    list: (state: MuralFilter): Promise<MuralMission[]> => mockResponse(read().filter((mission) => muralStateOf(mission) === state)),

    getById: (id: string): Promise<MuralMission | null> => mockResponse(read().find((mission) => mission.id === id) ?? null),

    /**
     * BE-06: cada envio cria uma submissão nova na missão — a primeira por POST, as seguintes
     * por PUT no mesmo recurso —, sempre com o FormData montado pela tela. Enquanto a API não
     * existe, a entrega fica no navegador para o mural refletir o novo estado ao voltar.
     */
    async submit(id: string, evidence: FormData): Promise<MuralMission> {
        const mission = read().find((item) => item.id === id);
        if (!mission) throw new Error("Missão não encontrada.");
        if (!acceptsEvidence(mission)) throw new Error("Esta missão já tem uma entrega em análise ou aprovada.");

        const submission = toSubmission(evidence);
        if (!submission.value) throw new Error("Anexe ou preencha a evidência pedida antes de enviar.");

        const stored = readStored();
        saveStored({ ...stored, [id]: [...(stored[id] ?? []), submission] });

        return mockResponse({ ...mission, submissions: [submission, ...mission.submissions] }, 700);
    },
};
