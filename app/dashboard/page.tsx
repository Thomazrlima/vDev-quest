"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { GameNav } from "@/components/GameNav";
import { ManaSeedAvatar } from "@/components/ManaSeedAvatar";
import { ChevronIcon, ScrollIcon, SparkIcon } from "@/components/icons";

const stages = [
  { id: 1, title: "Fundamentos", subtitle: "O despertar do código", status: "done", xp: "+800 EXP", description: "Lógica, Git e os primeiros encantamentos da web." },
  { id: 2, title: "Frontend", subtitle: "A floresta dos componentes", status: "done", xp: "+1.250 EXP", description: "HTML, CSS, JavaScript e interfaces responsivas." },
  { id: 3, title: "React", subtitle: "O templo dos estados", status: "done", xp: "+1.800 EXP", description: "Componentes, hooks e arquiteturas que escalam." },
  { id: 4, title: "Next.js", subtitle: "A fortaleza full-stack", status: "current", xp: "65%", description: "App Router, renderização e rotas de uma aplicação épica." },
  { id: 5, title: "Lenda Dev", subtitle: "O desafio do dragão", status: "locked", xp: "Bloqueado", description: "Conclua a etapa anterior para revelar o desafio final." }
] as const;

export default function DashboardPage() {
  const [selected, setSelected] = useState(4);
  const activeStage = stages.find((stage) => stage.id === selected) ?? stages[3];

  return (
    <div className="min-h-screen bg-[linear-gradient(rgba(8,10,8,.90),rgba(8,10,8,.97)),url('/art/quest-landscape.png')] bg-cover bg-fixed bg-center">
      <GameNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="pixel-panel relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(217,154,43,.12),transparent_36%)]" />
          <div className="relative grid gap-7 p-5 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:p-10">
            <div className="relative mx-auto lg:mx-0">
              <div className="absolute -inset-3 border-2 border-dashed border-[#684719]" />
              <ManaSeedAvatar size="xl" alt="Avatar de RafaelDev" className="relative border-4 shadow-[6px_6px_0_#070806]" />
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 border-2 border-[#8e631e] bg-[#15130d] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gold-light shadow-[3px_3px_0_#050605]">Guerreiro</span>
            </div>

            <div className="text-center lg:text-left">
              <p className="eyebrow mb-2">Perfil do aventureiro</p>
              <h1 className="text-3xl font-black tracking-tight text-[#f6e8c5] sm:text-4xl">Rafael Martins</h1>
              <p className="mt-1 text-xs font-bold text-[#8e8a7b]">@RafaelDev · membro desde a Temporada I</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                <Badge tone="gold" symbol="✦" label="Caçador de Bugs" />
                <Badge tone="green" symbol="◆" label="Guardião do Git" />
                <Badge tone="blue" symbol="✧" label="React Adept" />
              </div>
            </div>

            <div className="mx-auto w-full max-w-sm border-l-0 border-[#493519] lg:mx-0 lg:w-64 lg:border-l-2 lg:pl-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="eyebrow">Nível atual</p>
                  <p className="pixel-title mt-1 text-4xl">42</p>
                </div>
                <span className="mb-1 text-[10px] font-bold text-[#8c887b]">18.560 EXP</span>
              </div>
              <div className="mt-3 h-4 border-2 border-[#60461c] bg-[#090a08] p-[2px] shadow-[inset_2px_2px_0_#030403]">
                <div className="h-full w-[72%] bg-[repeating-linear-gradient(90deg,#d99a2b_0_8px,#edb84e_8px_12px)]" />
              </div>
              <p className="mt-2 text-right text-[10px] text-[#777367]">2.440 EXP para o nível 43</p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-2">Mapa de progresso</p>
              <h2 className="pixel-title text-2xl sm:text-3xl">Trilha da jornada</h2>
              <p className="mt-2 max-w-2xl text-sm text-[#9f9a89]">Cada etapa dominada abre novas rotas, desafios e recompensas.</p>
            </div>
            <div className="flex items-center gap-2 border-2 border-[#483619] bg-[#10130f] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#aca58f]">
              <SparkIcon className="h-4 w-4 text-gold" /> 3 de 5 concluídas
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="pixel-panel overflow-hidden p-4 sm:p-7">
              <div className="relative grid gap-4 md:grid-cols-5 md:gap-2">
                <div className="absolute left-[10%] right-[10%] top-[39px] hidden h-1 bg-[#342817] md:block">
                  <div className="h-full w-[70%] bg-[repeating-linear-gradient(90deg,#976a25_0_10px,#d99a2b_10px_14px)]" />
                </div>

                {stages.map((stage) => {
                  const isSelected = selected === stage.id;
                  const done = stage.status === "done";
                  const locked = stage.status === "locked";
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setSelected(stage.id)}
                      className={`group relative z-10 flex items-center gap-4 border-2 p-3 text-left transition md:flex-col md:border-transparent md:bg-transparent md:p-2 md:text-center ${isSelected ? "border-[#856020] bg-[#272012] md:border-transparent" : "border-[#30291b] bg-[#10120f]"}`}
                    >
                      <span className={`grid h-14 w-14 shrink-0 place-items-center border-4 text-xl font-black shadow-[4px_4px_0_#050605] transition md:h-20 md:w-20 md:text-2xl ${done ? "border-[#b47b26] bg-[#664315] text-[#ffd370]" : locked ? "border-[#3c3c35] bg-[#171916] text-[#68685f]" : "quest-current border-gold bg-[#19160d] text-gold-light"}`}>
                        {done ? "✓" : locked ? "▣" : stage.id}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-[10px] font-black uppercase tracking-widest ${locked ? "text-[#6a685f]" : "text-[#d4a549]"}`}>Etapa {stage.id}</span>
                        <span className={`mt-1 block text-sm font-black ${locked ? "text-[#76746b]" : "text-[#e9d9b5]"}`}>{stage.title}</span>
                        <span className="mt-1 hidden text-[9px] leading-relaxed text-[#817d70] sm:block">{stage.subtitle}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="pixel-panel flex min-h-[250px] flex-col p-6" aria-live="polite">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center border-2 border-[#7e581e] bg-[#292011] text-gold-light shadow-[3px_3px_0_#050605]">
                  <ScrollIcon className="h-6 w-6" />
                </span>
                <span className={`border-2 px-2 py-1 text-[9px] font-black uppercase tracking-wider ${activeStage.status === "done" ? "border-[#557346] bg-[#1b2b1c] text-[#8cc778]" : activeStage.status === "locked" ? "border-[#46463f] bg-[#1b1d1a] text-[#77776f]" : "border-[#815a1e] bg-[#33250f] text-gold-light"}`}>
                  {activeStage.status === "done" ? "Concluída" : activeStage.status === "locked" ? "Bloqueada" : "Em progresso"}
                </span>
              </div>
              <p className="eyebrow mt-6">Etapa {activeStage.id}</p>
              <h3 className="mt-2 text-xl font-black text-[#f0dfb6]">{activeStage.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#989484]">{activeStage.description}</p>
              <div className="mt-auto flex items-center justify-between border-t-2 border-[#352919] pt-5">
                <span className="text-xs font-black text-gold-light">{activeStage.xp}</span>
                <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#b98a38] hover:text-gold-light">
                  Ver missões <ChevronIcon className="h-4 w-4" />
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["12", "Quests concluídas"],
            ["07", "Insígnias raras"],
            ["18.560", "EXP acumulada"]
          ].map(([value, label]) => (
            <div key={label} className="border-2 border-[#4a371a] bg-[#10130f] p-5 text-center shadow-[4px_4px_0_#050605]">
              <p className="text-2xl font-black text-gold-light">{value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#827e71]">{label}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
