import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { SUBMISSION_STATUSES, SUBMISSION_STATUS_LABELS, type FeedFilters as Filters, type MuralMission, type SubmissionStatus } from "@/types/mission";

/** "Todos os status" é uma opção de verdade, para o filtro dar meia-volta sem recarregar a tela. */
const statusOptions = [{ value: "", label: "Todos os status" }, ...SUBMISSION_STATUSES.map((status) => ({ value: status, label: SUBMISSION_STATUS_LABELS[status] }))];

type FeedFiltersProps = {
    missions: MuralMission[];
    filters: Filters;
    onChange: (filters: Filters) => void;
    onClear: () => void;
};

/** O recorte do mosaico: de qual missão é a entrega e em que pé ela está. */
export function FeedFilters({ missions, filters, onChange, onClear }: FeedFiltersProps) {
    const missionOptions = useMemo(() => [{ value: "", label: "Todas as missões" }, ...missions.map((mission) => ({ value: mission.id, label: mission.title }))], [missions]);
    const filtering = Boolean(filters.missionId || filters.status);

    return (
        <div className="grid gap-4 border-b-2 border-primary-dark bg-black p-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
            <Select label="Filtrar por missão" value={filters.missionId} onChange={(missionId) => onChange({ ...filters, missionId })} options={missionOptions} placeholder="Todas as missões" />
            <Select label="Filtrar por status" value={filters.status} onChange={(status) => onChange({ ...filters, status: status as SubmissionStatus | "" })} options={statusOptions} placeholder="Todos os status" />
            <Button type="button" variant="secondary" onClick={onClear} disabled={!filtering} className="h-[46px] border-primary-dark px-5 py-3 text-[10px] text-primary-light">
                Limpar
            </Button>
        </div>
    );
}
