import { userManager } from "@/auth/oidc";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

export class ApiError extends Error {
    constructor(message: string, readonly status: number, readonly problem?: Record<string, unknown> | null) {
        super(message);
    }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const user = await userManager.getUser();
    if (!user || user.expired) throw new ApiError("Sua sessão expirou. Entre novamente para continuar.", 401);
    let response: Response;
    try {
        response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${user.access_token}`,
                ...(!(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
                ...options.headers,
            },
        });
    } catch {
        throw new ApiError("Não foi possível conectar à API. Verifique se o backend está em execução e tente novamente.", 0);
    }
    if (response.status === 401) {
        await userManager.removeUser();
        throw new ApiError("Sua sessão foi recusada. Entre novamente para continuar.", 401);
    }
    if (response.status === 204) return undefined as T;
    if (!response.ok) {
        const problem = await response.json().catch(() => null) as ({ detail?: string; title?: string } & Record<string, unknown>) | null;
        throw new ApiError(problem?.detail ?? problem?.title ?? `Falha na comunicação com o servidor (${response.status}).`, response.status, problem);
    }
    return response.json() as Promise<T>;
}

export const mutationKey = () => crypto.randomUUID();
