import { afterEach, describe, expect, spyOn, test } from "bun:test";
import type { User } from "oidc-client-ts";
import { userManager } from "@/auth/oidc";
import { api, ApiError } from "@/api/client";
import { muralService } from "@/api/mural";

const id = "01977777-7777-7777-8777-777777777777";
const submissionId = "01977777-7777-7777-8777-777777777778";

afterEach(() => {
    spyOn(userManager, "getUser").mockRestore();
    spyOn(globalThis, "fetch").mockRestore();
});

describe("cliente da API", () => {
    test("envia o token de acesso e mostra o detalhe de ProblemDetail", async () => {
        spyOn(userManager, "getUser").mockResolvedValue({ access_token: "token-local", expired: false } as User);
        const fetch = spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ detail: "Data inválida." }), { status: 422, headers: { "Content-Type": "application/problem+json" } }));

        await expect(api("/me")).rejects.toEqual(new ApiError("Data inválida.", 422));
        expect(fetch.mock.calls[0]?.[0]).toBe("/api/v1/me");
        expect((fetch.mock.calls[0]?.[1] as RequestInit).headers).toMatchObject({ Authorization: "Bearer token-local" });
    });

    test("nunca reutiliza dados de exemplo no mural", async () => {
        spyOn(userManager, "getUser").mockResolvedValue({ access_token: "token-local", expired: false } as User);
        spyOn(globalThis, "fetch").mockImplementation(async (input) => {
            const path = String(input);
            if (path.startsWith("/api/v1/mural")) return new Response(JSON.stringify([{
                id, title: "Revisar código", description: "Revise um PR", evidenceType: "link", status: "in_progress",
                submissionId, nextPhase: { number: 2, title: "Conclusão", xpReward: 20 }, occurrenceDate: null,
                isCheckin: false, allowsMultipleSubmissions: false, endDate: "2026-09-30", xpReward: 30, phaseCount: 2,
            }]));
            if (path.startsWith("/api/v1/me/submissions")) return new Response(JSON.stringify({ items: [{
                id: submissionId, missionId: id, missionTitle: "Revisar código", currentPhase: 1, occurrenceDate: null,
                status: "active", submittedAt: "2026-09-21T12:00:00Z", statusChangedAt: null, invalidationJustification: null,
                collaboratorName: "Ana", collaboratorEmail: "ana@example.org", evidenceType: "link", evidenceValue: "https://example.org/pr/1", originalFileName: null,
                evidencePhase: 1, evidences: [{ phaseNumber: 1, evidenceValue: "https://example.org/pr/1", originalFileName: null, submittedAt: "2026-09-21T12:00:00Z" }],
                missionDescription: "Revise um PR", missionEndDate: "2026-09-30", missionXp: 30, missionPhaseCount: 2,
            }], nextCursor: null }));
            throw new Error(`Rota inesperada: ${path}`);
        });

        const [mission] = await muralService.all();
        expect(mission.title).toBe("Revisar código");
        expect(mission.state).toBe("aguardando");
        expect(mission.canSubmit).toBe(true);
        expect(mission.submissionId).toBe(submissionId);
        expect(mission.submissions[0]?.status).toBe("ativa");
        expect(mission.submissions[0]?.value).toBe("https://example.org/pr/1");
        expect(mission.submissions[0]?.evidences?.[0]).toMatchObject({ phaseNumber: 1, kind: "link", value: "https://example.org/pr/1" });
    });
});
