import { api, ApiError, mutationKey } from "@/api/client";

export type ImportError = { line: number; field: string; reason: string };
export type ImportResult = { imported: number };

export function importErrors(error: unknown): ImportError[] {
    if (!(error instanceof ApiError) || !Array.isArray(error.problem?.errors)) return [];
    return error.problem.errors.filter((entry): entry is ImportError =>
        typeof entry === "object" && entry !== null && typeof entry.line === "number" && typeof entry.field === "string" && typeof entry.reason === "string",
    );
}

export const importService = {
    upload(file: File, key = mutationKey()): Promise<ImportResult> {
        const body = new FormData();
        body.append("file", file);
        return api<ImportResult>("/imports", { method: "POST", headers: { "Idempotency-Key": key }, body });
    },
};
