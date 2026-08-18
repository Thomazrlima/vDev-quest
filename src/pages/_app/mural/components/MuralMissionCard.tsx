import { DeadlineIcon, PdfEvidenceIcon, PendingIcon, PhotoEvidenceIcon, SparkIcon } from "@/components/icons";
import { PaperSheet, PAPER_TILTS } from "@/components/ui/PaperSheet";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import type { MuralMission } from "@/types/mission";
import { daysUntil, formatDate } from "@/utils/date";

/**
 * A folha lacrada é a das concluídas: o lacre de cera da guilda já diz que aquela entrega passou
 * pela moderação, e por isso ela dispensa o selo miúdo do cabeçalho — o estado dela vem carimbado
 * atravessado no papel. As outras duas ficam com o papel limpo e um selo em tinta, porque o dourado
 * da interface desapareceria sobre o pergaminho.
 */
const stateStamp = {
    disponiveis: { label: "Disponível", sheet: "plain", chip: { Icon: SparkIcon, className: "border-ink text-ink-dark" } },
    aguardando: { label: "Aguardando", sheet: "plain", chip: { Icon: PendingIcon, className: "border-orange-dark text-orange-dark" } },
    concluidas: { label: "Concluída", sheet: "sealed", chip: null },
} as const;

/** Nem o sol castiga duas folhas igual: o tom também vem da posição, não de um sorteio. */
const aging = ["", "brightness-[1.04] saturate-[.92]", "brightness-[.97] saturate-[1.06]", "brightness-[1.01] sepia-[.12]"] as const;

/** O prazo só vira alerta enquanto a missão ainda depende do colaborador. */
const URGENT_THRESHOLD_IN_DAYS = 3;

function deadlineLabel(remainingDays: number) {
    if (remainingDays < 0) return "Prazo encerrado";
    if (remainingDays === 0) return "Encerra hoje";
    if (remainingDays === 1) return "Encerra amanhã";
    return `Encerra em ${remainingDays} dias`;
}

export function MuralMissionCard({ mission, index = 0 }: { mission: MuralMission; index?: number }) {
    const stamp = stateStamp[mission.state];
    const { chip } = stamp;
    // O lacre come 35% do rodapé da folha, então ela resume a missão em uma linha a menos.
    const sealed = stamp.sheet === "sealed";
    const EvidenceIcon = mission.evidenceType === "PDF" ? PdfEvidenceIcon : PhotoEvidenceIcon;
    const remainingDays = daysUntil(mission.deadline);
    const urgent = mission.state === "disponiveis" && remainingDays <= URGENT_THRESHOLD_IN_DAYS;

    return (
        // Ao passar o mouse o papel se endireita e sobe, como se fosse tirado do prego.
        <div className={cn("transition duration-200 hover:z-10 hover:-translate-y-1.5 hover:rotate-0", PAPER_TILTS[index % PAPER_TILTS.length])}>
            <PaperSheet as="article" variant={stamp.sheet} imageClassName={aging[index % aging.length]}>
                {/*
                 Carimbo de borracha batido por cima de tudo, como o "confidencial" de uma pasta: o
                 `multiply` deixa a textura e as dobras do papel atravessarem a tinta, que é a mesma
                 do lacre de cera. O texto é de verdade — quem lê por leitor de tela ouve o estado.
                */}
                <header className="flex items-start justify-between gap-[.6em]">
                    <h3 className="line-clamp-3 min-w-0 text-[clamp(1rem,5cqw,1.5rem)] font-black leading-[1.15] text-ink-dark">{renderTextWithNumericFont(mission.title)}</h3>
                    {chip ? (
                        <span className={cn("flex shrink-0 -rotate-2 items-center gap-[.4em] border-2 px-[.55em] py-[.4em] text-[clamp(.5rem,2.2cqw,.72rem)] font-black uppercase leading-none tracking-[.1em]", chip.className)}>
                            <chip.Icon className="size-[1.3em]" />
                            {stamp.label}
                        </span>
                    ) : null}
                </header>

                <p className={cn("mt-[.9em] text-[clamp(.8rem,3.6cqw,1.1rem)] leading-relaxed text-ink", sealed ? "line-clamp-3" : "line-clamp-4")}>{renderTextWithNumericFont(mission.description)}</p>

                {/* A folha é mais alta do que o texto pede; a recompensa ocupa a sobra do meio em vez
                    de deixar um vazio entre o resumo e o rodapé. */}
                <div className="my-auto flex flex-col items-center gap-[.15em] py-[.7em] text-center">
                    <span className="flex items-center gap-[.5em] text-[clamp(.58rem,2.5cqw,.8rem)] font-black uppercase tracking-[.22em] text-ink">
                        <SparkIcon className="size-[1.3em]" /> Recompensa
                    </span>
                    <strong className="text-[clamp(1.5rem,8.5cqw,2.7rem)] font-black leading-none text-ink-dark">{renderTextWithNumericFont(`${mission.xp} EXP`)}</strong>
                </div>

                {/*
                 Carimbo de borracha batido por cima do papel, como o "confidencial" de uma pasta. Ele
                 entra na coluna entre a recompensa e o rodapé — em vez de flutuar numa altura fixa —
                 para que missão nenhuma acabe com o carimbo em cima da própria EXP; a rotação não
                 conta no layout, então as pontas invadem o filete e a folga de cima sozinhas. O
                 `multiply` deixa a textura e as dobras do papel atravessarem a tinta, como carimbo
                 de verdade, e o texto também é: quem lê por leitor de tela ouve o estado.
                */}
                {sealed ? <strong className="pointer-events-none relative z-1 mx-auto -rotate-[14deg] border-[.14em] px-[.32em] py-[.12em] text-[clamp(1.25rem,7.2cqw,2.35rem)] font-black uppercase leading-none tracking-[.14em] text-stamp opacity-85 mix-blend-multiply [border-color:currentColor]">{stamp.label}</strong> : null}

                <dl className="grid gap-[.6em] border-t-2 border-ink-light/60 pt-[1em] text-[clamp(.62rem,2.8cqw,.85rem)] font-black uppercase tracking-[.08em]">
                    <div className="flex items-center justify-between gap-[.8em]">
                        <dt className="flex items-center gap-[.5em] text-ink">
                            <EvidenceIcon className="size-[1.3em]" /> Evidência
                        </dt>
                        <dd className="normal-case tracking-normal text-ink">{renderTextWithNumericFont(mission.evidenceType)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-[.8em]">
                        <dt className={cn("flex items-center gap-[.5em]", urgent ? "text-orange-dark" : "text-ink")}>
                            <DeadlineIcon className="size-[1.3em]" /> Prazo
                        </dt>
                        <dd className={cn("text-right", urgent ? "text-orange-dark" : "text-ink-dark")}>
                            {renderTextWithNumericFont(formatDate(mission.deadline, "dd/MM/yyyy"))}
                            <span className={cn("mt-[.2em] block text-[.8em] tracking-[.1em]", urgent ? "text-orange-dark" : "text-ink")}>{renderTextWithNumericFont(deadlineLabel(remainingDays))}</span>
                        </dd>
                    </div>
                </dl>
            </PaperSheet>
        </div>
    );
}
