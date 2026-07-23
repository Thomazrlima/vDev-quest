"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { GameNav } from "@/components/GameNav";
import { ManaSeedAnimatedCharacter } from "@/components/ManaSeedAnimatedCharacter";
import { ManaSeedAvatar } from "@/components/ManaSeedAvatar";
import { CrownIcon, SparkIcon } from "@/components/icons";

const leaders = [
  { position: 1, name: "RafaelDev", level: 42, exp: "18.560", badges: ["gold", "gold", "blue"] as const },
  { position: 2, name: "CamilaCode", level: 38, exp: "17.940", badges: ["silver", "green", "purple"] as const },
  { position: 3, name: "LucasByte", level: 34, exp: "17.120", badges: ["gold", "blue", "purple"] as const }
];

const adventurers = [
  { position: 4, name: "MarcosCmd", title: "Guerreiro de Terminal", level: 32, avatar: 3, exp: "15.870", progress: 88, badges: ["gold", "green", "blue"] as const },
  { position: 5, name: "BiaScript", title: "Tecelã de Interfaces", level: 30, avatar: 4, exp: "14.260", progress: 78, badges: ["silver", "purple", "green"] as const },
  { position: 6, name: "DevJunior", title: "Paladino do Frontend", level: 29, avatar: 5, exp: "13.870", progress: 72, badges: ["gold", "blue", "purple"] as const },
  { position: 7, name: "AnaQA", title: "Sentinela dos Bugs", level: 27, avatar: 6, exp: "12.450", progress: 65, badges: ["silver", "green"] as const },
  { position: 8, name: "GuiTeste", title: "Mago dos Testes", level: 25, avatar: 7, exp: "11.780", progress: 57, badges: ["gold", "purple"] as const },
  { position: 9, name: "LeoStack", title: "Ranger Full-Stack", level: 24, avatar: 2, exp: "10.980", progress: 49, badges: ["silver", "blue"] as const },
  { position: 10, name: "JulioAPI", title: "Alquimista de APIs", level: 22, avatar: 8, exp: "9.650", progress: 42, badges: ["gold", "green"] as const }
];

export default function RankingPage() {
  const [scope, setScope] = useState<"global" | "semanal">("global");
  const visibleAdventurers = useMemo(() => scope === "global" ? adventurers : [...adventurers].sort((a, b) => b.progress - a.progress), [scope]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_10%,rgba(125,74,18,.16),transparent_35%),linear-gradient(rgba(7,8,7,.93),rgba(7,8,7,.98)),url('/art/quest-landscape.png')] bg-cover bg-fixed bg-center">
      <GameNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-3 text-gold">
            <span className="h-[2px] w-10 bg-gradient-to-r from-transparent to-gold" />
            <CrownIcon className="h-7 w-7" />
            <span className="h-[2px] w-10 bg-gradient-to-l from-transparent to-gold" />
          </div>
          <p className="eyebrow">Salão da glória · Temporada III</p>
          <h1 className="pixel-title mx-auto mt-3 max-w-4xl text-3xl sm:text-4xl lg:text-5xl">Ranking de aventureiros</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#999483]">Os maiores heróis, os códigos mais lendários. Conquiste EXP e escreva seu nome no topo.</p>

          <div className="mx-auto mt-6 flex w-fit border-2 border-[#55401d] bg-[#10120f] p-1 shadow-[4px_4px_0_#050605]">
            {(["global", "semanal"] as const).map((item) => (
              <button key={item} onClick={() => setScope(item)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${scope === item ? "bg-[#664616] text-gold-light" : "text-[#767267] hover:text-cream"}`}>
                {item}
              </button>
            ))}
          </div>
        </header>

        <section className="mx-auto mt-12 grid max-w-5xl items-end gap-5 md:grid-cols-3" aria-label="Pódio dos três melhores aventureiros">
          {leaders.map((leader) => {
            const first = leader.position === 1;
            return (
              <article key={leader.position} className={`relative flex flex-col items-center text-center ${leader.position === 1 ? "md:order-2" : leader.position === 2 ? "md:order-1" : "md:order-3"}`}>
                {first ? <div className="ember absolute -top-8 left-1/2 h-2 w-2 -translate-x-1/2 bg-gold shadow-[18px_10px_0_#a8671d,-20px_16px_0_#d99a2b,4px_-12px_0_#f1c461]" /> : null}
                <div className={`pixel-panel relative w-full px-4 pb-5 pt-7 ${first ? "border-[#d99a2b] bg-[#211b0f] md:pb-8 md:pt-9" : "border-[#66481d]"}`}>
                  {first ? <CrownIcon className="absolute -top-7 left-1/2 h-10 w-10 -translate-x-1/2 fill-[#d99a2b] text-[#f3c15a] [filter:drop-shadow(3px_3px_0_#4b2c0a)]" /> : null}
                  <div className={`relative mx-auto grid place-items-end ${first ? "-mt-3 h-72 sm:h-80" : "h-60 sm:h-64"}`}>
                    <span className={`absolute bottom-1 h-10 rounded-[50%] bg-[#050605]/75 blur-sm ${first ? "w-44" : "w-36"}`} />
                    <ManaSeedAnimatedCharacter
                      alt={`Pixel art de corpo inteiro de ${leader.name}`}
                      className={`mana-seed-podium-character relative z-10 ${first ? "mana-seed-podium-character--first h-72 w-72 sm:h-96 sm:w-96" : "h-64 w-64 sm:h-72 sm:w-72"}`}
                    />
                  </div>
                  <h2 className={`mt-5 font-black text-[#f2e2bd] ${first ? "text-xl" : "text-lg"}`}>{leader.name}</h2>
                  <p className="mt-1 text-xs font-black uppercase tracking-wider text-gold">Nível {leader.level}</p>
                  <div className="mt-4 flex justify-center gap-2">
                    {leader.badges.map((tone, index) => <Badge key={`${tone}-${index}`} tone={tone} compact symbol={index === 2 ? "◆" : "✦"} />)}
                  </div>
                  <p className="mt-3 text-[10px] text-[#777367]">{leader.exp} EXP</p>
                </div>
                <div className={`relative z-10 grid w-[76%] place-items-center border-x-4 border-b-4 border-[#543913] bg-[#1b160e] font-black text-gold-light shadow-[6px_6px_0_#030403] ${first ? "h-20 text-4xl md:h-24" : "h-16 text-3xl"}`}>
                  <span className="[text-shadow:3px_3px_0_#4a2e0c]">{leader.position}</span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="pixel-panel mt-12 overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b-2 border-[#5f451e] bg-[#17150f] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <p className="eyebrow">Classificação geral</p>
              <h2 className="mt-1 text-lg font-black text-[#eadab8]">A elite da guilda</h2>
            </div>
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#837f72]"><SparkIcon className="h-4 w-4 text-gold" /> Atualizado há 2 min</span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[72px_1.5fr_100px_150px_180px] items-center gap-3 border-b-2 border-[#3b2d18] bg-[#0d0f0d] px-5 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#bd8a34] sm:px-7">
                <span>Pos.</span><span>Aventureiro</span><span>Nível</span><span>Badges</span><span className="text-right">EXP</span>
              </div>

              {visibleAdventurers.map((person) => (
                <div key={person.position} className="group grid grid-cols-[72px_1.5fr_100px_150px_180px] items-center gap-3 border-b border-[#352a19] px-5 py-4 transition hover:bg-[#2a2112] sm:px-7">
                  <span className="text-center text-xl font-black text-[#d6c59f]">{String(person.position).padStart(2, "0")}</span>
                  <div className="flex min-w-0 items-center gap-4">
                    <ManaSeedAvatar size="md" alt={`Avatar de ${person.name}`} className="border-[#785821]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#eee0bf]">{person.name}</p>
                      <p className="mt-1 truncate text-[9px] uppercase tracking-wider text-[#777468]">{person.title}</p>
                    </div>
                  </div>
                  <span className="w-fit border-2 border-[#78561f] bg-[#211b10] px-3 py-2 text-sm font-black text-gold-light shadow-[2px_2px_0_#050605]">{person.level}</span>
                  <div className="flex gap-2">
                    {person.badges.map((tone, index) => <Badge key={`${tone}-${index}`} tone={tone} compact symbol={index % 2 ? "✦" : "◆"} />)}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#ddd0b0]">{person.exp}</p>
                    <div className="mt-2 ml-auto h-3 w-32 border-2 border-[#503b1b] bg-[#090a08] p-[1px]">
                      <div className="h-full bg-[repeating-linear-gradient(90deg,#bb7720_0_7px,#e0a83b_7px_10px)]" style={{ width: `${person.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p className="mt-7 text-center text-[10px] uppercase tracking-[0.16em] text-[#69665d]">O ranking reinicia em 12 dias · continue sua jornada</p>
      </main>
    </div>
  );
}
