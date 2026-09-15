import { AlertIcon, DoneIcon, PendingIcon } from "@/components/icons";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { SUBMISSION_STATUS_LABELS, type SubmissionStatus } from "@/types/mission";

/** O veredito de uma entrega: é a submissão que é aprovada ou recusada, não a missão. */
const statuses = {
    pendente: { Icon: PendingIcon, tone: "muted" },
    aprovada: { Icon: DoneIcon, tone: "success" },
    recusada: { Icon: AlertIcon, tone: "danger" },
} as const satisfies Record<SubmissionStatus, { Icon: typeof DoneIcon; tone: BadgeTone }>;

/** No mosaico do feed não cabe o rótulo: `compact` deixa só o símbolo, e o texto segue para quem lê a tela. */
export function SubmissionStatusBadge({ status, compact = false, className }: { status: SubmissionStatus; compact?: boolean; className?: string }) {
    const { Icon, tone } = statuses[status];
    const label = SUBMISSION_STATUS_LABELS[status];

    return (
        <Badge tone={tone} icon={<Icon className="h-3.5 w-3.5" />} className={className}>
            <span className={compact ? "sr-only" : undefined}>{label}</span>
        </Badge>
    );
}
