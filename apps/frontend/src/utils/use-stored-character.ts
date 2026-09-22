import { useQuery } from "@tanstack/react-query";
import { avatarService } from "@/api/avatar";
import { useAuth } from "@/auth/useAuth";
import { DEFAULT_CHARACTER } from "@/utils/character-storage";

export function useStoredCharacter() {
    const { accessToken } = useAuth();
    const { data, isSuccess, error } = useQuery({ queryKey: ["character"], queryFn: avatarService.read, enabled: Boolean(accessToken) });
    return { ...DEFAULT_CHARACTER, ...data, ready: isSuccess, error };
}
