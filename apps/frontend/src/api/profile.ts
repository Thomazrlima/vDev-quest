import { api } from "@/api/client";
import type { Profile } from "@/api/types";

export const profileService = {
    me: () => api<Profile>("/me"),
    rename: (name: string) => api<Profile>("/me", { method: "PATCH", body: JSON.stringify({ name }) }),
};
