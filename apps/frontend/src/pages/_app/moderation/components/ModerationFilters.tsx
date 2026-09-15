import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Collaborator } from "@/types/moderation";

type MissionOption = { id: string; title: string };

export function ModerationFilters({ collaborators, missions, collaboratorQuery, missionId, onCollaboratorChange, onMissionChange, onClear }: { collaborators: Collaborator[]; missions: MissionOption[]; collaboratorQuery: string; missionId: string; onCollaboratorChange: (value: string) => void; onMissionChange: (value: string) => void; onClear: () => void }) {
    // "Todas as missões" continua sendo uma opção de verdade, para dar meia-volta no filtro.
    const missionOptions = useMemo(() => [{ value: "", label: "Todas as missões" }, ...missions.map((item) => ({ value: item.id, label: item.title }))], [missions]);

    return (
        <div className="border-b-2 border-primary-dark bg-black p-5 sm:px-7">
            <Eyebrow>R1-02 · Filtros da fila</Eyebrow>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
                <Input label="Pesquisar colaborador" list="moderation-collaborators" value={collaboratorQuery} onChange={(event) => onCollaboratorChange(event.target.value)} placeholder="Digite ou selecione um colaborador">
                    <datalist id="moderation-collaborators">
                        {collaborators.map((item) => (
                            <option key={item.id} value={item.name} />
                        ))}
                    </datalist>
                </Input>
                <Select label="Filtrar por missão" value={missionId} onChange={onMissionChange} options={missionOptions} placeholder="Todas as missões" />
                <Button type="button" variant="secondary" onClick={onClear} disabled={!collaboratorQuery && !missionId} className="h-[46px] border-primary-dark px-5 py-3 text-[10px] text-primary-light">
                    Limpar
                </Button>
            </div>
        </div>
    );
}
