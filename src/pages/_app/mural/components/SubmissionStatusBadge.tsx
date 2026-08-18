import { AlertIcon, DoneIcon, PendingIcon } from "@/components/icons";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { SubmissionStatus } from "@/types/mission";

/** O veredito de uma entrega: é a submissão que é aprovada ou recusada, não a missão. */
const statuses = {
    pendente: { label: "Em análise", Icon: PendingIcon, tone: "muted" },
    aprovada: { label: "Aprovada", Icon: DoneIcon, tone: "success" },
    recusada: { label: "Recusada", Icon: AlertIcon, tone: "danger" },
} as const satisfies Record<SubmissionStatus, { label: string; Icon: typeof DoneIcon; tone: BadgeTone }>;

export function SubmissionStatusBadge({ status, className }: { status: SubmissionStatus; className?: string }) {
    const { label, Icon, tone } = statuses[status];

    return (
        <Badge tone={tone} icon={<Icon className="h-3.5 w-3.5" />} className={className}>
            {label}
        </Badge>
    );
}
