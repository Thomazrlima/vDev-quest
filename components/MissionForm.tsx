"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EVIDENCE_TYPES, Mission, MissionFormData, createMission, getMissionById, updateMission } from "@/lib/missions";
import { ChevronIcon, ScrollIcon, SparkIcon } from "./icons";

type FieldName = keyof MissionFormData;
type FieldErrors = Partial<Record<FieldName, string>>;

const emptyForm: MissionFormData = {
  title: "",
  description: "",
  evidenceType: "",
  xp: "",
  startDate: "",
  endDate: ""
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
  return errors;
}

export function MissionForm({ missionId }: { missionId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<MissionFormData>(emptyForm);
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(Boolean(missionId));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!missionId) return;
    getMissionById(missionId).then((data) => {
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
          endDate: data.endDate
        });
      }
      setLoading(false);
    });
  }, [missionId]);

  const readOnly = Boolean(mission?.hasProgress);
  const valid = useMemo(() => Object.keys(validate(form)).length === 0, [form]);
  const title = missionId ? "Editar missão" : "Nova missão";

  function updateField(field: FieldName, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setNotice(null);
  }

  function markInvalidFields() {
    setErrors(validate(form));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || readOnly) return;

    setSaving(true);
    setNotice(null);
    try {
      if (missionId) await updateMission(missionId, form);
      else await createMission(form);
      router.push("/missions?published=1");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível salvar a missão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <MissionShell title={title}><div className="pixel-panel p-8 text-center text-sm text-[#a9a18f]">Carregando pergaminho da missão...</div></MissionShell>;
  }

  if (missionId && !mission) {
    return <MissionShell title={title}><div className="pixel-panel p-8 text-center"><p className="text-sm text-[#e7c08a]">{notice}</p><button onClick={() => router.push("/missions")} className="pixel-button mt-5 px-5 py-3 text-[10px]">Voltar para missões</button></div></MissionShell>;
  }

  return (
    <MissionShell title={title} subtitle={missionId ? "Atualize os detalhes antes que a aventura comece." : "Prepare um novo desafio para a guilda."}>
      {readOnly ? (
        <div role="alert" className="mb-6 flex gap-3 border-2 border-[#a45d25] bg-[#321d12] p-4 text-[#f3c78b] shadow-[4px_4px_0_#080705]">
          <span className="grid h-7 w-7 shrink-0 place-items-center border-2 border-[#d6923b] bg-[#573114] font-black">!</span>
          <div><p className="text-xs font-black uppercase tracking-wider">Edição bloqueada</p><p className="mt-1 text-xs leading-relaxed text-[#d6b082]">Não é possível editar missões que já possuem progresso. Esta missão já recebeu evidências ou EXP.</p></div>
        </div>
      ) : null}

      {notice && !readOnly ? <div role="alert" className="mb-6 border-2 border-[#a45d25] bg-[#321d12] px-4 py-3 text-xs font-bold text-[#f3c78b]">{notice}</div> : null}

      <form onSubmit={submit} noValidate className="pixel-panel overflow-hidden">
        <div className="border-b-2 border-[#5c421c] bg-[#17160f] px-5 py-5 sm:px-7">
          <p className="eyebrow">R1-01 · Formulário de missão</p>
          <h2 className="mt-1 text-lg font-black text-[#f0dfb6]">Informações do desafio</h2>
          <p className="mt-1 text-xs text-[#938d7d]">Campos marcados com <span className="text-gold">*</span> são obrigatórios.</p>
        </div>

        <fieldset disabled={readOnly} className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
          <Field label="Título da missão" error={errors.title} className="sm:col-span-2">
            <input value={form.title} onChange={(event) => updateField("title", event.target.value)} onBlur={markInvalidFields} placeholder="Ex.: Código limpo, guilda forte" className={inputClass(errors.title)} />
          </Field>
          <Field label="Descrição do desafio" error={errors.description} className="sm:col-span-2">
            <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} onBlur={markInvalidFields} placeholder="Explique o que o aventureiro deve realizar..." rows={5} className={`${inputClass(errors.description)} min-h-28 resize-y`} />
          </Field>
          <Field label="Tipo de evidência" error={errors.evidenceType}>
            <select value={form.evidenceType} onChange={(event) => updateField("evidenceType", event.target.value)} onBlur={markInvalidFields} className={inputClass(errors.evidenceType)}>
              <option value="">Selecione uma opção</option>
              {EVIDENCE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </Field>
          <Field label="Recompensa" error={errors.xp}>
            <div className="relative"><input type="number" min="1" value={form.xp} onChange={(event) => updateField("xp", event.target.value)} onBlur={markInvalidFields} placeholder="0" className={`${inputClass(errors.xp)} pr-16`} /><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gold">EXP</span></div>
          </Field>
          <Field label="Início da missão" error={errors.startDate}>
            <input type="date" value={form.startDate} onChange={(event) => updateField("startDate", event.target.value)} onBlur={markInvalidFields} className={inputClass(errors.startDate)} />
          </Field>
          <Field label="Encerramento" error={errors.endDate}>
            <input type="date" min={form.startDate} value={form.endDate} onChange={(event) => updateField("endDate", event.target.value)} onBlur={markInvalidFields} className={inputClass(errors.endDate)} />
          </Field>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 border-t-2 border-[#493519] bg-[#11130f] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-[10px] leading-relaxed text-[#807b6f]">Ao publicar, a missão ficará disponível para os colaboradores.</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => router.push("/missions")} className="pixel-button pixel-button-secondary px-4 py-3 text-[10px]">Cancelar</button>
            <button type="submit" disabled={!valid || saving || readOnly} className="pixel-button min-w-32 px-4 py-3 text-[10px] disabled:cursor-not-allowed disabled:opacity-45" title={!valid ? "Preencha os campos obrigatórios para publicar" : undefined}>
              {saving ? <><SparkIcon className="h-4 w-4 animate-spin" /> Salvando</> : missionId ? "Salvar alterações" : "Publicar"}
            </button>
          </div>
        </div>
      </form>
    </MissionShell>
  );
}

function inputClass(error?: string) {
  return `w-full border-2 bg-[#0c0f0c] px-4 py-3 text-sm text-cream outline-none shadow-[inset_3px_3px_0_#060705] transition placeholder:text-[#5e5d55] focus:border-gold disabled:cursor-not-allowed disabled:border-[#42433d] disabled:bg-[#10110f] disabled:text-[#817f73] ${error ? "border-[#bb6240]" : "border-[#76521e]"}`;
}

function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-gold-light">{label} <span className="text-gold">*</span></span>{children}{error ? <span className="mt-2 block text-[11px] font-bold text-[#e58c67]">{error}</span> : null}</label>;
}

function MissionShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const router = useRouter();
  return <div className="min-h-screen bg-[radial-gradient(circle_at_80%_12%,rgba(125,74,18,.18),transparent_26%),linear-gradient(rgba(7,8,7,.91),rgba(7,8,7,.98)),url('/art/quest-landscape.png')] bg-cover bg-fixed bg-center"><main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10"><button onClick={() => router.push("/missions")} className="mb-7 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#b58a3e] hover:text-gold-light"><ChevronIcon className="h-4 w-4 rotate-180" /> Missões</button><header className="mb-8 flex gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center border-2 border-[#8f6522] bg-[#2c210f] text-gold-light shadow-[4px_4px_0_#080705]"><ScrollIcon className="h-6 w-6" /></span><div><p className="eyebrow">Gestão de missões · OS-1</p><h1 className="pixel-title mt-1 text-2xl sm:text-3xl">{title}</h1>{subtitle ? <p className="mt-2 text-sm text-[#9b9687]">{subtitle}</p> : null}</div></header>{children}</main></div>;
}
