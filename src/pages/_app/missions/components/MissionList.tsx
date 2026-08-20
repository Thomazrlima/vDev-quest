import { ScrollIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import { RECURRENCE_TYPE_LABELS, WEEKDAY_LABELS, type Mission } from "@/types/mission";

export function MissionList({ missions, loading, onOpen }: { missions: Mission[]; loading: boolean; onOpen: (mission: Mission) => void }) {
    return (
        <Card className={cn("mt-8 overflow-hidden", HALL_PANEL)}>
            <div className="grid grid-cols-[1fr_auto] border-b-2 border-primary-dark bg-black px-5 py-3.5 text-[.7rem] font-black uppercase tracking-[.15em] text-primary-light sm:grid-cols-[1.4fr_.7fr_.7fr_auto] sm:px-7" role="row">
                <span>Missão</span>
                <span className="hidden sm:block">Evidência</span>
                <span className="hidden sm:block">Recompensa</span>
                <span>Ações</span>
            </div>
            {loading ? (
                <Loading message="Carregando missões..." />
            ) : (
                missions.map((mission) => (
                    <article key={mission.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-primary-dark px-5 py-5 transition odd:bg-black-soft even:bg-black-muted last:border-b-0 hover:bg-primary-overlay sm:grid-cols-[1.4fr_.7fr_.7fr_auto] sm:px-7">
                        <div className="flex min-w-0 gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-primary-dark bg-black text-primary">
                                <ScrollIcon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="truncate text-[.98rem] font-black text-primary-light">{renderTextWithNumericFont(mission.title)}</h2>
                                <p className="mt-1 truncate text-[.65rem] font-black uppercase tracking-[.08em] text-primary">{renderTextWithNumericFont(mission.hasProgress ? "Em andamento · edição bloqueada" : `${mission.status} · ${mission.updatedAt}`)}</p>
                                {mission.recurrenceType !== "none" ? <p className="mt-1 truncate text-[.62rem] font-bold text-white-muted">{renderTextWithNumericFont(recurrenceSummary(mission))}</p> : null}
                            </div>
                        </div>
                        <span className="hidden text-xs text-white-muted sm:block">{renderTextWithNumericFont(mission.evidenceType)}</span>
                        <strong className="hidden text-[.78rem] font-black text-primary-light sm:block">{renderTextWithNumericFont(`${mission.xp} EXP`)}</strong>
                        <Button variant="secondary" onClick={() => onOpen(mission)} className="border-2 border-primary-dark px-3 py-2 text-[10px] text-primary-light">
                            {mission.hasProgress ? "Ver" : "Editar"}
                        </Button>
                    </article>
                ))
            )}
        </Card>
    );
}

function recurrenceSummary(mission: Mission) {
    const type = RECURRENCE_TYPE_LABELS[mission.recurrenceType];
    if (mission.recurrenceType !== "weekly") return type;
    const days = mission.recurrenceDays.map((day) => WEEKDAY_LABELS[day].slice(0, 3)).join(", ");
    return days ? `${type}: ${days}` : type;
}
