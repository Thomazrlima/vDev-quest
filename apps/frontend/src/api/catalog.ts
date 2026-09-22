import { api, mutationKey } from "@/api/client";

export type CatalogEntry = { id: string; code: string; label: string; description: string | null; imagePath: string | null };

export const catalogService = {
    titles: () => api<CatalogEntry[]>("/catalog/titles"),
    badges: () => api<CatalogEntry[]>("/catalog/badges"),
    createTitle: (entry: { label: string; description: string }, key = mutationKey()) =>
        api<CatalogEntry>("/catalog/titles", { method: "POST", headers: { "Idempotency-Key": key }, body: JSON.stringify(entry) }),
    createBadge: (entry: { label: string; description: string; imagePath: string }, key = mutationKey()) =>
        api<CatalogEntry>("/catalog/badges", { method: "POST", headers: { "Idempotency-Key": key }, body: JSON.stringify(entry) }),
};
