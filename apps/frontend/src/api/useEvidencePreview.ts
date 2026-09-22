import { useQuery } from "@tanstack/react-query";
import { muralService } from "@/api/mural";
import type { FeedEntry } from "@/types/mission";

/** Busca apenas as fotos exibidas; a URL privada expira após cinco minutos. */
export function useEvidencePreview({ mission, submission }: FeedEntry) {
    const isPhoto = mission.evidenceType === "Foto (PNG, JPEG)" && submission.kind === "file";
    const phase = submission.downloadPhase ?? submission.phase ?? 1;
    const { data } = useQuery({
        queryKey: ["evidence-preview", submission.id, phase],
        queryFn: () => muralService.download(submission.id, phase),
        enabled: isPhoto,
        staleTime: 4 * 60_000,
    });
    return isPhoto ? data : undefined;
}
