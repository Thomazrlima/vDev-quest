import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { missionService } from "@/api/missions";
import { mutationKey } from "@/api/client";
import { ChevronIcon, ScrollIcon, SparkIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import { Select } from "@/components/ui/Select";
import { BLEED_UNDER_RETURN_LINK, HALL_PANEL, StoneWall } from "@/components/ui/StoneWall";
import { TextArea } from "@/components/ui/TextArea";
import { cn } from "@/lib/tailwind";
import { EVIDENCE_TYPES, RECURRENCE_TYPE_LABELS, WEEKDAYS, WEEKDAY_LABELS, type Mission, type MissionFormData, type RecurrenceType, type Weekday } from "@/types/mission";

const EVIDENCE_OPTIONS = EVIDENCE_TYPES.map((type) => ({ value: type, label: type }));
const RECURRENCE_OPTIONS = Object.entries(RECURRENCE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

type FormErrors = {
    title?: string;
    description?: string;
    evidenceType?: string;
    startDate?: string;
    endDate?: string;
    recurrenceDays?: string;
    checkinMonth?: string;
    phases?: string;
    phaseDrafts: { title?: string; xp?: string }[];
};

function monthInSaoPaulo() {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit" }).formatToParts(new Date());
    const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? "";
    return `${part("year")}-${part("month")}`;
}

function emptyForm(): MissionFormData {
    return { title: "", description: "", evidenceType: "", startDate: "", endDate: "", recurrenceType: "none", recurrenceDays: [], isCheckin: false, checkinMonth: monthInSaoPaulo(), allowsMultipleSubmissions: false, phaseDrafts: [{ title: "Conclusão", xp: "" }] };
}

function validate(form: MissionFormData): FormErrors {
    const errors: FormErrors = { phaseDrafts: form.phaseDrafts.map(() => ({})) };
    if (!form.title.trim()) errors.title = "Informe o título da missão.";
    if (!form.description.trim()) errors.description = "Descreva o desafio da missão.";
    if (!form.evidenceType) errors.evidenceType = "Selecione o tipo de evidência.";
    if (form.isCheckin) {
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(form.checkinMonth)) errors.checkinMonth = "Escolha o mês do check-in.";
    } else {
        if (!form.startDate) errors.startDate = "Informe a data de início.";
        if (!form.endDate) errors.endDate = "Informe a data de encerramento.";
        if (form.startDate && form.endDate && form.endDate < form.startDate) errors.endDate = "A data final deve ser posterior à inicial.";
        if (form.recurrenceType === "weekly" && !form.recurrenceDays.length) errors.recurrenceDays = "Escolha pelo menos um dia da semana.";
    }
    if (!form.phaseDrafts.length) errors.phases = "Adicione pelo menos uma fase.";
    if ((form.isCheckin || form.recurrenceType !== "none") && form.phaseDrafts.length > 1) errors.phases = "Missões recorrentes e check-ins têm uma única fase.";
    form.phaseDrafts.forEach((phase, index) => {
        if (!phase.title.trim()) errors.phaseDrafts[index].title = "Informe o nome da fase.";
        const reward = Number(phase.xp);
        if (!phase.xp || !Number.isSafeInteger(reward) || reward <= 0) errors.phaseDrafts[index].xp = "Informe uma recompensa inteira maior que zero.";
    });
    return errors;
}

function hasErrors(errors: FormErrors) {
    return Object.entries(errors).some(([key, value]) => (key === "phaseDrafts" ? errors.phaseDrafts.some((phase) => Boolean(phase.title || phase.xp)) : Boolean(value)));
}

export function MissionForm({ missionId }: { missionId?: string }) {
    const navigate = useNavigate();
    const { data: mission, isPending, error } = useQuery({ queryKey: ["missions", missionId], queryFn: () => missionService.getById(missionId!), enabled: Boolean(missionId) });
    const title = missionId ? "Editar missão" : "Nova missão";
    if (missionId && isPending)
        return (
            <MissionShell title={title}>
                <Card className={HALL_PANEL}>
                    <Loading message="Carregando missão..." />
                </Card>
            </MissionShell>
        );
    if (missionId && (error || !mission))
        return (
            <MissionShell title={title}>
                <Card className={cn("p-8 text-center", HALL_PANEL)}>
                    <p role={error ? "alert" : undefined} className="text-sm text-primary-light">
                        {error?.message ?? "Missão não encontrada."}
                    </p>
                    <Button onClick={() => navigate({ to: "/missions" })} className="mt-5 px-5 text-[10px]">
                        Voltar para missões
                    </Button>
                </Card>
            </MissionShell>
        );
    return <MissionFormEditor key={missionId ?? "new"} missionId={missionId} mission={mission ?? null} />;
}

function MissionFormEditor({ missionId, mission }: { missionId?: string; mission: Mission | null }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const createKey = useRef(mutationKey());
    const [form, setForm] = useState<MissionFormData>(() =>
        mission
            ? {
                  title: mission.title,
                  description: mission.description,
                  evidenceType: mission.evidenceType,
                  startDate: mission.startDate,
                  endDate: mission.endDate,
                  recurrenceType: mission.recurrenceType,
                  recurrenceDays: mission.recurrenceDays,
                  isCheckin: mission.isCheckin,
                  checkinMonth: mission.checkinMonth,
                  allowsMultipleSubmissions: mission.allowsMultipleSubmissions,
                  phaseDrafts: mission.phaseDrafts.map((phase) => ({ ...phase })),
              }
            : emptyForm(),
    );
    const [errors, setErrors] = useState<FormErrors>({ phaseDrafts: [] });
    const [saving, setSaving] = useState(false);
    const [invalidating, setInvalidating] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const rulesLocked = Boolean(mission?.hasProgress);
    const readOnly = mission?.status === "Invalidada";
    const valid = !hasErrors(validate(form));

    function change(next: MissionFormData) {
        createKey.current = mutationKey();
        setForm(next);
        setErrors({ phaseDrafts: [] });
        setNotice(null);
    }
    function updateField<K extends keyof MissionFormData>(field: K, value: MissionFormData[K]) {
        change({ ...form, [field]: value });
    }
    function setCheckin(checked: boolean) {
        change({ ...form, isCheckin: checked, recurrenceType: checked ? "monthly" : "none", recurrenceDays: [], allowsMultipleSubmissions: false, checkinMonth: form.checkinMonth || monthInSaoPaulo(), phaseDrafts: checked ? [{ title: "Check-in", xp: "1" }] : [{ title: "Conclusão", xp: form.phaseDrafts[0]?.xp ?? "" }] });
    }
    function setRecurrence(value: RecurrenceType) {
        change({ ...form, recurrenceType: value, recurrenceDays: value === "weekly" ? form.recurrenceDays : [], allowsMultipleSubmissions: value === "none" && form.allowsMultipleSubmissions, phaseDrafts: value === "none" ? form.phaseDrafts : form.phaseDrafts.slice(0, 1) });
    }
    function toggleWeekday(day: Weekday) {
        updateField("recurrenceDays", form.recurrenceDays.includes(day) ? form.recurrenceDays.filter((item) => item !== day) : [...form.recurrenceDays, day]);
    }
    function updatePhase(index: number, field: "title" | "xp", value: string) {
        updateField(
            "phaseDrafts",
            form.phaseDrafts.map((phase, phaseIndex) => (phaseIndex === index ? { ...phase, [field]: value } : phase)),
        );
    }
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (hasErrors(nextErrors) || readOnly) return;
        setSaving(true);
        setNotice(null);
        try {
            if (missionId) await missionService.update(missionId, form);
            else await missionService.create(form, createKey.current);
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["missions"] }), queryClient.invalidateQueries({ queryKey: ["mural"] })]);
            navigate({ to: "/missions", search: { published: "1" } });
        } catch (cause) {
            setNotice(cause instanceof Error ? cause.message : "Não foi possível salvar a missão. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }
    async function invalidateMission() {
        if (!missionId || !mission || !window.confirm(`Invalidar “${mission.title}”? As submissões ativas terão sua EXP revertida.`)) return;
        setInvalidating(true);
        setNotice(null);
        try {
            await missionService.invalidate(missionId);
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["missions"] }), queryClient.invalidateQueries({ queryKey: ["mural"] }), queryClient.invalidateQueries({ queryKey: ["profile"] }), queryClient.invalidateQueries({ queryKey: ["ranking"] })]);
            navigate({ to: "/missions" });
        } catch (cause) {
            setNotice(cause instanceof Error ? cause.message : "Não foi possível invalidar a missão.");
        } finally {
            setInvalidating(false);
        }
    }

    const totalXp = form.phaseDrafts.reduce((sum, phase) => sum + (Number(phase.xp) || 0), 0);
    return (
        <MissionShell title={missionId ? "Editar missão" : "Nova missão"} subtitle={missionId ? "Ajuste os detalhes sem perder o histórico de quem já participou." : "Defina o desafio e a recompensa para a guilda."}>
            {rulesLocked || readOnly ? (
                <p role="status" className="mb-5 border-l-4 border-primary bg-black-overlay px-4 py-3 text-xs leading-relaxed text-primary-light">
                    {readOnly ? "Esta missão foi invalidada e está disponível somente para consulta." : "Esta missão já recebeu submissões. Você pode corrigir título e descrição; as regras e recompensas permanecem como foram criadas."}
                </p>
            ) : null}
            {notice ? (
                <p role="alert" className="mb-5 border-2 border-(--color-danger) bg-danger-overlay px-4 py-3 text-xs font-bold text-(--color-danger-light)">
                    {notice}
                </p>
            ) : null}
            <Card as="form" onSubmit={submit} noValidate className={HALL_PANEL}>
                <div className="border-b-2 border-primary-dark bg-black px-5 py-5 sm:px-7">
                    <h2 className="text-lg font-black text-primary-light">Informações do desafio</h2>
                    <p className="mt-1 text-xs text-white-muted">Campos marcados com * são obrigatórios.</p>
                </div>
                <fieldset disabled={saving || invalidating || readOnly} className="grid gap-5 bg-black-overlay p-5 sm:p-7">
                    <Input label="Título da missão" error={errors.title} value={form.title} onChange={(event) => updateField("title", event.target.value)} maxLength={140} placeholder="Ex.: Código limpo, guilda forte" required />
                    <TextArea label="Descrição do desafio" error={errors.description} value={form.description} onChange={(event) => updateField("description", event.target.value)} maxLength={4000} placeholder="Explique o que a pessoa deve realizar..." rows={5} required />
                </fieldset>
                <fieldset disabled={saving || invalidating || rulesLocked || readOnly} className="border-t-2 border-primary-dark bg-black-overlay p-5 sm:p-7">
                    <legend className="sr-only">Regras da missão</legend>
                    <h3 className="text-base font-black text-primary-light">Regras da missão</h3>
                    <p className="mt-1 text-xs text-white-muted">Escolha entre um desafio comum e o registro de presença do mês.</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {(
                            [
                                { value: false, label: "Missão comum", help: "Pode ser recorrente ou ter várias fases." },
                                { value: true, label: "Check-in mensal", help: "Uma data por envio, com bônus por constância." },
                            ] as const
                        ).map((option) => (
                            <label key={option.label} className={cn("flex cursor-pointer gap-3 border-2 bg-black px-4 py-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-light", form.isCheckin === option.value ? "border-primary" : "border-primary-dark")}>
                                <input type="radio" name="mission-kind" checked={form.isCheckin === option.value} onChange={() => setCheckin(option.value)} className="mt-0.5 h-4 w-4 accent-primary" />
                                <span>
                                    <strong className="block text-sm text-primary-light">{option.label}</strong>
                                    <span className="mt-1 block text-xs leading-relaxed text-white-muted">{option.help}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <Select label="Tipo de evidência" error={errors.evidenceType} value={form.evidenceType} onChange={(value) => updateField("evidenceType", value as MissionFormData["evidenceType"])} options={EVIDENCE_OPTIONS} required disabled={saving || rulesLocked || readOnly} />
                        {form.isCheckin ? <Input label="Mês do check-in" type="month" value={form.checkinMonth} onChange={(event) => updateField("checkinMonth", event.target.value)} error={errors.checkinMonth} description="A vigência cobre do primeiro ao último dia do mês." required /> : <Select label="Recorrência" value={form.recurrenceType} onChange={(value) => setRecurrence(value as RecurrenceType)} options={RECURRENCE_OPTIONS} disabled={saving || rulesLocked || readOnly} />}
                        {!form.isCheckin ? (
                            <>
                                {form.recurrenceType === "weekly" ? (
                                    <div className="sm:col-span-2">
                                        <p className="mb-2 text-[11px] font-black text-primary-light">Dias da semana *</p>
                                        <div className="flex flex-wrap gap-2" role="group" aria-label="Dias da semana">
                                            {WEEKDAYS.map((day) => (
                                                <label key={day} className={cn("cursor-pointer border-2 px-3 py-2 text-xs focus-within:outline-2 focus-within:outline-primary-light", form.recurrenceDays.includes(day) ? "border-primary bg-primary-dark text-primary-light" : "border-primary-dark bg-black text-white-muted")}>
                                                    <input type="checkbox" className="sr-only" checked={form.recurrenceDays.includes(day)} onChange={() => toggleWeekday(day)} />
                                                    {WEEKDAY_LABELS[day]}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.recurrenceDays ? (
                                            <p role="alert" className="mt-2 text-xs text-(--color-danger)">
                                                {errors.recurrenceDays}
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}
                                <Input label={form.recurrenceType === "none" ? "Início da missão" : "Início da recorrência"} type="date" value={form.startDate} onChange={(event) => updateField("startDate", event.target.value)} error={errors.startDate} required />
                                <Input label={form.recurrenceType === "none" ? "Encerramento" : "Término da recorrência"} type="date" min={form.startDate} value={form.endDate} onChange={(event) => updateField("endDate", event.target.value)} error={errors.endDate} required />
                            </>
                        ) : null}
                    </div>
                    {!form.isCheckin && form.recurrenceType === "none" ? (
                        <label className="mt-6 flex cursor-pointer items-start gap-3 border-t border-primary-dark pt-5 text-sm text-primary-light focus-within:outline-2 focus-within:outline-primary-light">
                            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" checked={form.allowsMultipleSubmissions} onChange={(event) => updateField("allowsMultipleSubmissions", event.target.checked)} />
                            <span>
                                <strong className="block">Permitir várias submissões independentes</strong>
                                <span className="mt-1 block text-xs leading-relaxed text-white-muted">Cada submissão tem suas próprias fases e sua própria recompensa.</span>
                            </span>
                        </label>
                    ) : null}
                </fieldset>
                <fieldset disabled={saving || invalidating || rulesLocked || readOnly} className="border-t-2 border-primary-dark bg-black-soft p-5 sm:p-7">
                    <legend className="sr-only">Fases e recompensas</legend>
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h3 className="text-base font-black text-primary-light">Fases e recompensas</h3>
                            <p className="mt-1 text-xs text-white-muted">A EXP é concedida assim que cada fase é enviada.</p>
                        </div>
                        <span className="text-sm font-black text-primary-light">Total: {totalXp} EXP</span>
                    </div>
                    <ol className="mt-5 divide-y divide-primary-dark border-y border-primary-dark">
                        {form.phaseDrafts.map((phase, index) => (
                            <li key={index} className="grid gap-4 py-5 sm:grid-cols-[auto_minmax(0,1fr)_11rem_auto] sm:items-start">
                                <span className="mt-3 text-xs font-black text-primary">{String(index + 1).padStart(2, "0")}</span>
                                <Input label="Nome da fase" value={phase.title} onChange={(event) => updatePhase(index, "title", event.target.value)} error={errors.phaseDrafts[index]?.title} maxLength={120} required />
                                <Input label="Recompensa" type="number" min="1" step="1" value={phase.xp} onChange={(event) => updatePhase(index, "xp", event.target.value)} error={errors.phaseDrafts[index]?.xp} endAdornment="EXP" required />
                                {form.phaseDrafts.length > 1 ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() =>
                                            updateField(
                                                "phaseDrafts",
                                                form.phaseDrafts.filter((_, phaseIndex) => phaseIndex !== index),
                                            )
                                        }
                                        aria-label={`Remover fase ${index + 1}`}
                                        className="self-end px-2 py-3 text-xs"
                                    >
                                        Remover
                                    </Button>
                                ) : (
                                    <span className="hidden sm:block" />
                                )}
                            </li>
                        ))}
                    </ol>
                    {errors.phases ? (
                        <p role="alert" className="mt-2 text-xs text-(--color-danger)">
                            {errors.phases}
                        </p>
                    ) : null}
                    {!form.isCheckin && form.recurrenceType === "none" ? (
                        <Button type="button" variant="secondary" onClick={() => updateField("phaseDrafts", [...form.phaseDrafts, { title: "", xp: "" }])} className="mt-5 border-primary-dark px-4 py-2 text-xs">
                            Adicionar fase
                        </Button>
                    ) : null}
                </fieldset>
                <div className="flex flex-col-reverse gap-3 border-t-2 border-primary-dark bg-black px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <p className="text-xs leading-relaxed text-white-muted">{missionId ? "As alterações ficam disponíveis após salvar." : "A missão fica disponível na data de início."}</p>
                    <div className="flex flex-wrap gap-3">
                        {missionId && !readOnly ? (
                            <Button type="button" variant="secondary" onClick={() => void invalidateMission()} inactive={saving || invalidating} className="border-red px-4 text-[10px] text-red-light">
                                {invalidating ? "Invalidando" : "Invalidar missão"}
                            </Button>
                        ) : null}
                        <Button type="submit" inactive={!valid || saving || invalidating || readOnly} className="min-w-32 px-4 text-[10px] shadow-[4px_4px_0_var(--color-primary-dark)]">
                            {saving ? (
                                <>
                                    <SparkIcon className="h-4 w-4 animate-spin" /> Salvando
                                </>
                            ) : missionId ? (
                                "Salvar alterações"
                            ) : (
                                "Criar missão"
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </MissionShell>
    );
}

function MissionShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
    const navigate = useNavigate();
    return (
        <main className={`flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
            <StoneWall>
                <div className="mx-auto w-[min(896px,100%)]">
                    <Button variant="ghost" onClick={() => navigate({ to: "/missions" })} className="mb-7 p-0 text-[11px] text-primary hover:text-primary-light">
                        <ChevronIcon className="h-4 w-4 rotate-180" /> Missões
                    </Button>
                    <header className="mb-8 flex gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center border-2 border-primary bg-black text-primary-light shadow-[4px_4px_0_var(--color-primary-dark)]">
                            <ScrollIcon className="h-6 w-6" />
                        </span>
                        <div>
                            <Eyebrow>Gestão de missões</Eyebrow>
                            <Heading className="mt-1">{title}</Heading>
                            {subtitle ? <p className="mt-2 text-sm text-primary-light/80">{subtitle}</p> : null}
                        </div>
                    </header>
                    {children}
                </div>
            </StoneWall>
        </main>
    );
}
