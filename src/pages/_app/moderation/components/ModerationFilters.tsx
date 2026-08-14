import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Collaborator } from "@/types/moderation";

type MissionOption = { id: string; title: string };

export function ModerationFilters({ collaborators, missions, collaboratorQuery, missionId, onCollaboratorChange, onMissionChange, onClear }: { collaborators: Collaborator[]; missions: MissionOption[]; collaboratorQuery: string; missionId: string; onCollaboratorChange: (value: string) => void; onMissionChange: (value: string) => void; onClear: () => void }) {
    return (
        <div className="border-b-2 border-[var(--color-orange-dark)] bg-[var(--color-primary-dark)] p-5 sm:px-7">
            <Eyebrow>R1-02 · Filtros da fila</Eyebrow>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
                <Input label="Pesquisar colaborador" list="moderation-collaborators" value={collaboratorQuery} onChange={(event) => onCollaboratorChange(event.target.value)} placeholder="Digite ou selecione um colaborador">
                    <datalist id="moderation-collaborators">
                        {collaborators.map((item) => (
                            <option key={item.id} value={item.name} />
                        ))}
                    </datalist>
                </Input>
                <Select label="Filtrar por missão" value={missionId} onChange={(event) => onMissionChange(event.target.value)}>
                    <option value="">Todas as missões</option>
                    {missions.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.title}
                        </option>
                    ))}
                </Select>
                <Button type="button" variant="secondary" onClick={onClear} disabled={!collaboratorQuery && !missionId} className="h-[46px] px-5 py-3 text-[10px]">
                    Limpar
                </Button>
            </div>
        </div>
    );
}
