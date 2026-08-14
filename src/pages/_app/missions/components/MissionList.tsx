import { ScrollIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import type { Mission } from "@/types/mission";

export function MissionList({ missions, loading, onOpen }: { missions: Mission[]; loading: boolean; onOpen: (mission: Mission) => void }) {
    return (
        <Card className="mt-8 overflow-hidden">
            <header className="grid grid-cols-[1fr_auto] border-b-2 border-[var(--color-orange-dark)] bg-[var(--color-primary-dark)] px-5 py-4 text-[10px] font-black uppercase tracking-wider text-[var(--color-black-muted)] sm:grid-cols-[1.4fr_.7fr_.7fr_auto] sm:px-7">
                <span>Missão</span>
                <span className="hidden sm:block">Evidência</span>
                <span className="hidden sm:block">Recompensa</span>
                <span>Ações</span>
            </header>
            {loading ? (
                <Loading message="Carregando missões..." />
            ) : (
                missions.map((mission) => (
                    <article key={mission.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b-2 border-[var(--color-primary-dark)] px-5 py-5 last:border-b-0 sm:grid-cols-[1.4fr_.7fr_.7fr_auto] sm:px-7">
                        <div className="flex min-w-0 gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[var(--color-orange-dark)] bg-[var(--color-orange-dark)] text-primary">
                                <ScrollIcon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-black text-[var(--color-orange-light)]">{mission.title}</h2>
                                <p className="mt-1 text-[10px] text-[var(--color-black-muted)]">{mission.hasProgress ? "Em andamento · edição bloqueada" : `${mission.status} · ${mission.updatedAt}`}</p>
                            </div>
                        </div>
                        <span className="hidden text-xs text-[var(--color-white-muted)] sm:block">{mission.evidenceType}</span>
                        <strong className="hidden text-xs font-black text-primary-light sm:block">{mission.xp} EXP</strong>
                        <Button variant="secondary" onClick={() => onOpen(mission)} className="border-2 px-3 py-2 text-[10px]">
                            {mission.hasProgress ? "Ver" : "Editar"}
                        </Button>
                    </article>
                ))
            )}
        </Card>
    );
}
