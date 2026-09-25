import { describe, expect, test } from "bun:test";
import type { Mission as ApiMission } from "@/api/types";
import { checkinDateRange, missionRequest, toUiMission } from "./missions";

const checkinMission: ApiMission = {
    id: "01a0dae0-e5ab-7bc6-b783-bd440ae22eff",
    slug: "qa-check-in",
    title: "Check-in mensal",
    description: "Registro de presença do mês",
    evidenceType: "text",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    recurrenceType: "monthly",
    weekdays: [],
    isCheckin: true,
    allowsMultipleSubmissions: false,
    status: "active",
    hasSubmissions: false,
    phases: [{ number: 1, title: "Check-in", xpReward: 5 }],
};

describe("hidratação da missão de check-in", () => {
    test("a edição reconhece o tipo de check-in e o mês do contrato da API", () => {
        const ui = toUiMission(checkinMission);
        expect(ui.isCheckin).toBeTrue();
        expect(ui.checkinMonth).toBe("2026-09");
        expect(ui.recurrenceType).toBe("monthly");
        expect(ui.phaseDrafts).toEqual([{ title: "Check-in", xp: "5" }]);
    });

    test("salvar sem alterações preserva a vigência do mês do check-in", () => {
        const form = toUiMission(checkinMission);
        const request = missionRequest({ ...form, phaseDrafts: form.phaseDrafts.map((phase) => ({ ...phase })) });
        expect(request.isCheckin).toBeTrue();
        expect(request.startDate).toBe("2026-09-01");
        expect(request.endDate).toBe("2026-09-30");
        expect(request.recurrenceType).toBe("monthly");
    });

    test("o mês do check-in cobre do primeiro ao último dia do mês", () => {
        expect(checkinDateRange("2026-09")).toEqual({ startDate: "2026-09-01", endDate: "2026-09-30" });
        expect(checkinDateRange("2026-02")).toEqual({ startDate: "2026-02-01", endDate: "2026-02-28" });
    });
});
