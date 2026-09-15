import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import { Select } from "@/components/ui/Select";
import { BLEED_UNDER_RETURN_LINK, HALL_PANEL, StoneWall } from "@/components/ui/StoneWall";
import { TextArea } from "@/components/ui/TextArea";
import { ChevronIcon, ScrollIcon, SparkIcon } from "@/components/icons";
import { cn } from "@/lib/tailwind";
import { missionService } from "@/mocks/services/missions";
import { EVIDENCE_TYPES, RECURRENCE_TYPE_LABELS, WEEKDAYS, WEEKDAY_LABELS, type Mission, type MissionFormData, type Weekday } from "@/types/mission";

type FieldName = keyof MissionFormData;
type FieldErrors = Partial<Record<FieldName, string>>;

/** O react-select fala em {value,label}; os tipos de evidência viram opções uma vez só. */
const EVIDENCE_OPTIONS = EVIDENCE_TYPES.map((type) => ({ value: type, label: type }));
const RECURRENCE_OPTIONS = Object.entries(RECURRENCE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const emptyForm: MissionFormData = {
    title: "",
    description: "",
    evidenceType: "",
    xp: "",
    startDate: "",
    endDate: "",
    recurrenceType: "none",
    recurrenceDays: [],
};

function validate(form: MissionFormData): FieldErrors {
    const errors: FieldErrors = {};
    if (!form.title.trim()) errors.title = "Informe o título da missão.";
    if (!form.description.trim()) errors.description = "Descreva o desafio da missão.";
    if (!form.evidenceType) errors.evidenceType = "Selecione o tipo de evidência.";
    if (!form.xp || Number(form.xp) <= 0) errors.xp = "Informe uma recompensa de EXP válida.";
    if (!form.startDate) errors.startDate = "Informe a data de início.";
    if (!form.endDate) errors.endDate = "Informe a data de encerramento.";
    if (form.startDate && form.endDate && form.endDate < form.startDate) errors.endDate = "A data final deve ser posterior à data inicial.";
    if (form.recurrenceType === "weekly" && !form.recurrenceDays.length) errors.recurrenceDays = "Escolha pelo menos um dia da semana.";
    return errors;
}

export function MissionForm({ missionId }: { missionId?: string }) {
    const navigate = useNavigate();
    const [form, setForm] = useState<MissionFormData>(emptyForm);
    const [mission, setMission] = useState<Mission | null>(null);
    const [loading, setLoading] = useState(Boolean(missionId));
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (!missionId) return;
        missionService.getById(missionId).then((data) => {
            if (!data) {
                setNotice("A missão solicitada não foi encontrada.");
            } else {
                setMission(data);
                setForm({
                    title: data.title,
                    description: data.description,
                    evidenceType: data.evidenceType,
                    xp: data.xp,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    recurrenceType: data.recurrenceType ?? "none",
                    recurrenceDays: data.recurrenceDays ?? [],
                });
            }
            setLoading(false);
        });
    }, [missionId]);

    const readOnly = Boolean(mission?.hasProgress);
    const valid = useMemo(() => Object.keys(validate(form)).length === 0, [form]);
    const title = missionId ? "Editar missão" : "Nova missão";

    function updateField(field: Exclude<FieldName, "recurrenceDays">, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
        setNotice(null);
    }

    function toggleWeekday(day: Weekday) {
        setForm((current) => ({
            ...current,
            recurrenceDays: current.recurrenceDays.includes(day) ? current.recurrenceDays.filter((item) => item !== day) : [...current.recurrenceDays, day],
        }));
        setErrors((current) => ({ ...current, recurrenceDays: undefined }));
        setNotice(null);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length || readOnly) return;

        setSaving(true);
        setNotice(null);
        try {
            if (missionId) await missionService.update(missionId, form);
            else await missionService.create(form);
            navigate({ to: "/missions", search: { published: "1" } });
        } catch (error) {
            setNotice(error instanceof Error ? error.message : "Não foi possível salvar a missão. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <MissionShell title={title}>
                <Card className={HALL_PANEL}>
                    <Loading message="Carregando pergaminho da missão..." />
                </Card>
            </MissionShell>
        );
    }

    if (missionId && !mission) {
        return (
            <MissionShell title={title}>
                <Card className={cn("p-8 text-center", HALL_PANEL)}>
                    <p className="text-sm text-primary-light">{notice}</p>
                    <Button onClick={() => navigate({ to: "/missions" })} className="mt-5 px-5 text-[10px]">
                        Voltar para missões
                    </Button>
                </Card>
            </MissionShell>
        );
    }

    return (
        <MissionShell title={title} subtitle={missionId ? "Atualize os detalhes antes que a aventura comece." : "Prepare um novo desafio para a guilda."}>
            {readOnly ? (
                <div className="fixed inset-0 z-100 grid place-items-center bg-black/80 p-5" role="presentation">
                    <section role="dialog" aria-modal="true" aria-labelledby="locked-mission-title" className="w-full max-w-md border-2 border-(--color-orange) bg-black shadow-[6px_6px_0_var(--color-orange-dark)]">
                        <div className="flex gap-3 border-b-2 border-(--color-orange-dark) bg-orange-overlay p-5 text-(--color-orange-light)">
                            <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-(--color-orange) bg-orange-dark font-black">!</span>
                            <div>
                                <h2 id="locked-mission-title" className="text-sm font-black uppercase tracking-wider">Edição bloqueada</h2>
                                <p className="mt-2 text-xs leading-relaxed">Não é possível editar missões que já possuem progresso. Esta missão já recebeu evidências ou EXP.</p>
                            </div>
                        </div>
                        <div className="flex justify-end p-5">
                            <Button onClick={() => navigate({ to: "/missions" })} className="px-5 text-[10px]">Voltar para missões</Button>
                        </div>
                    </section>
                </div>
            ) : null}

            {notice && !readOnly ? (
                <div role="alert" className="mb-6 border-2 border-(--color-orange) bg-orange-overlay px-4 py-3 text-xs font-bold text-(--color-orange-light)">
                    {notice}
                </div>
            ) : null}

            <Card as="form" onSubmit={submit} noValidate className={HALL_PANEL}>
                <div className="border-b-2 border-primary-dark bg-black px-5 py-5 sm:px-7">
                    <Eyebrow>R1-01 · Formulário de missão</Eyebrow>
                    <h2 className="mt-1 text-lg font-black uppercase tracking-[.08em] text-primary-light">Informações do desafio</h2>
                    <p className="mt-1 text-xs text-white-muted">
                        Campos marcados com <span className="text-primary">*</span> são obrigatórios.
                    </p>
                </div>

                <fieldset disabled={readOnly} className="grid gap-5 bg-black-overlay p-5 sm:grid-cols-2 sm:p-7">
                    <Input label="Título da missão" error={errors.title} containerClassName="sm:col-span-2" value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Ex.: Código limpo, guilda forte" required />
                    <TextArea label="Descrição do desafio" error={errors.description} containerClassName="sm:col-span-2" value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Explique o que o aventureiro deve realizar..." rows={5} required />
                    <Select label="Tipo de evidência" error={errors.evidenceType} value={form.evidenceType} onChange={(evidenceType) => updateField("evidenceType", evidenceType)} options={EVIDENCE_OPTIONS} placeholder="Selecione uma opção" disabled={readOnly} required />
                    <Input label="Recompensa" error={errors.xp} type="number" min="1" value={form.xp} onChange={(event) => updateField("xp", event.target.value)} placeholder="0" endAdornment="EXP" required />
                    <Select label="Recorrência" description="Defina com que frequência a missão ficará disponível." error={errors.recurrenceType} value={form.recurrenceType} onChange={(recurrenceType) => updateField("recurrenceType", recurrenceType)} options={RECURRENCE_OPTIONS} disabled={readOnly} required />
                    {form.recurrenceType === "weekly" ? (
                        <div className="sm:col-span-2">
                            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-primary-light">
                                Dias da semana <span className="text-primary">*</span>
                            </p>
                            <p className="mb-3 text-[11px] text-white-muted">Selecione os dias em que a missão deve se repetir.</p>
                            <div className="flex flex-wrap gap-2" aria-describedby={errors.recurrenceDays ? "recurrence-days-error" : undefined}>
                                {WEEKDAYS.map((day) => {
                                    const selected = form.recurrenceDays.includes(day);
                                    return (
                                        <label key={day} className={cn("cursor-pointer border-2 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] transition", selected ? "border-primary bg-primary-dark text-primary-light" : "border-primary-dark bg-black text-white-muted hover:border-primary")}>
                                            <input type="checkbox" className="sr-only" checked={selected} onChange={() => toggleWeekday(day)} />
                                            {WEEKDAY_LABELS[day]}
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.recurrenceDays ? <span id="recurrence-days-error" role="alert" className="mt-2 block text-[11px] font-bold text-(--color-orange)">{errors.recurrenceDays}</span> : null}
                        </div>
                    ) : null}
                    <Input label={form.recurrenceType === "none" ? "Início da missão" : "Início da recorrência"} error={errors.startDate} type="date" value={form.startDate} onChange={(event) => updateField("startDate", event.target.value)} required />
                    <Input label={form.recurrenceType === "none" ? "Encerramento" : "Término da recorrência"} error={errors.endDate} type="date" min={form.startDate} value={form.endDate} onChange={(event) => updateField("endDate", event.target.value)} required />
                </fieldset>

                <div className="flex flex-col-reverse gap-3 border-t-2 border-primary-dark bg-black px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <p className="text-[10px] leading-relaxed text-white-muted">Ao publicar, a missão ficará disponível para os colaboradores.</p>
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => navigate({ to: "/missions" })} className="border-primary-dark px-4 text-[10px] text-primary-light">
                            Cancelar
                        </Button>
                        <Button type="submit" inactive={!valid || saving || readOnly} className="min-w-32 px-4 text-[10px] shadow-[4px_4px_0_var(--color-primary-dark)]" title={!valid ? "Preencha os campos obrigatórios para publicar" : undefined}>
                            {saving ? (
                                <>
                                    <SparkIcon className="h-4 w-4 animate-spin" /> Salvando
                                </>
                            ) : missionId ? (
                                "Salvar alterações"
                            ) : (
                                "Publicar"
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </MissionShell>
    );
}

function MissionShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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
                            <Eyebrow>Gestão de missões · OS-1</Eyebrow>
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
