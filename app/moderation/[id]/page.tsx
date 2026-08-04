import { EvidenceDetailsTemplate } from "@/components/templates/EvidenceDetailsTemplate";

export default function EvidenceDetailsPage({ params }: { params: Promise<{ id: string }> }) { return <EvidenceDetailsTemplate params={params} />; }
