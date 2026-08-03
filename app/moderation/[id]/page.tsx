"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronIcon, ScrollIcon } from "@/components/icons";
import { EvidenceSubmission, getEvidenceById } from "@/lib/moderation";

function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" }).format(new Date(value)); }

export default function EvidenceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [evidence, setEvidence] = useState<EvidenceSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { params.then(({ id }) => getEvidenceById(id).then((data) => { setEvidence(data); setLoading(false); })); }, [params]);
  return <div className="min-h-screen bg-[linear-gradient(rgba(7,8,7,.91),rgba(7,8,7,.98)),url('/art/quest-landscape.png')] bg-cover bg-fixed bg-center"><main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10"><button onClick={() => router.push("/moderation")} className="mb-7 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#b58a3e] hover:text-gold-light"><ChevronIcon className="h-4 w-4 rotate-180" /> Fila de moderação</button>{loading ? <div className="pixel-panel p-8 text-center text-sm text-[#a9a18f]">Carregando evidência...</div> : !evidence ? <div className="pixel-panel p-8 text-center"><p className="text-sm text-[#e7c08a]">Evidência não encontrada.</p></div> : <section className="pixel-panel overflow-hidden"><div className="border-b-2 border-[#5c421c] bg-[#17160f] p-6"><p className="eyebrow">FE-03 / FE-04 · Detalhe da evidência</p><h1 className="pixel-title mt-2 text-2xl">Entrega de {evidence.collaborator.name}</h1><p className="mt-2 text-sm text-[#9f9a89]">Registro pendente para a missão “{evidence.missionTitle}”.</p></div><div className="grid gap-5 p-6 sm:grid-cols-2"><Detail label="Missão" value={evidence.missionTitle} /><Detail label="Tipo enviado" value={evidence.evidenceType} /><Detail label="Arquivo" value={evidence.fileName} /><Detail label="Submetida em" value={formatDate(evidence.submittedAt)} /></div><div className="border-t-2 border-[#493519] bg-[#11130f] p-6 text-xs text-[#908979]"><ScrollIcon className="mr-2 inline h-4 w-4 text-gold" /> Ações de aprovar ou reprovar serão disponibilizadas nas interfaces FE-03/FE-04.</div></section>}</main></div>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="border-2 border-[#4d391b] bg-[#10120f] p-4"><p className="text-[10px] font-black uppercase tracking-wider text-gold-light">{label}</p><p className="mt-2 text-sm font-bold text-[#e8dab9]">{value}</p></div>; }
