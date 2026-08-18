import { DoneIcon, PendingIcon, SparkIcon } from "@/components/icons";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { MuralFilter } from "@/types/mission";

/** O estado da missão sai das submissões; o selo só o traduz para quem está lendo o mural. */
const states = {
    disponiveis: { label: "Disponível", Icon: SparkIcon, tone: "primary" },
    aguardando: { label: "Em análise", Icon: PendingIcon, tone: "muted" },
    concluidas: { label: "Concluída", Icon: DoneIcon, tone: "success" },
} as const satisfies Record<MuralFilter, { label: string; Icon: typeof SparkIcon; tone: BadgeTone }>;

export function MuralStateBadge({ state, className }: { state: MuralFilter; className?: string }) {
    const { label, Icon, tone } = states[state];

    return (
        <Badge tone={tone} icon={<Icon className="h-3.5 w-3.5" />} className={className}>
            {label}
        </Badge>
    );
}
