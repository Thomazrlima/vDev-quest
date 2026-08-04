"use client";

import { useMemo, useState, type ComponentType, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import { GameNav } from "@/components/GameNav";
import { ManaSeedSpriteLayers } from "@/components/ManaSeedSpriteLayers";
import { AccessoryIcon, EyeIcon, FaceIcon, HairIcon, PantsIcon, ShirtIcon, ShoeIcon, SparkIcon } from "@/components/icons";
import { DEFAULT_MANA_SEED_APPEARANCE, MANA_SEED_FREE, type ManaSeedAppearance, manaSeedLayersFor } from "@/lib/manaSeed";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
type Aura = { name: string; color: string; wash: string };

const presets: { id: string; label: string; helper: string; icon: Icon; appearance: ManaSeedAppearance }[] = [
  { id: "farmer", label: "Fazendeiro", helper: "Traje da colheita", icon: ShirtIcon, appearance: { hair: "dapper", shirt: "short", headwear: "cowboyHat" } },
  { id: "villager", label: "Aldeão", helper: "Roupa para a vila", icon: FaceIcon, appearance: { hair: "bob", shirt: "shortBoobs", headwear: "none" } },
  { id: "traveler", label: "Viajante", helper: "Leve e prático", icon: ShoeIcon, appearance: { hair: "dapper", shirt: "shortBoobs", headwear: "none" } },
  { id: "worker", label: "Artesão", helper: "Pronto para criar", icon: PantsIcon, appearance: { hair: "bob", shirt: "short", headwear: "cowboyHat" } }
];

const auras: Aura[] = [
  { name: "Druida", color: "#758b47", wash: "rgba(104,139,58,.72)" },
  { name: "Bardo", color: "#d2a343", wash: "rgba(210,163,67,.72)" },
  { name: "Guerreiro", color: "#bb6551", wash: "rgba(187,101,81,.7)" },
  { name: "Clérigo", color: "#4a9ba1", wash: "rgba(74,155,161,.7)" },
  { name: "Buxro", color: "#8875b8", wash: "rgba(136,117,184,.68)" },
  { name: "Necromante", color: "#8b8476", wash: "rgba(139,132,118,.66)" }
];

function cycle<T extends string>(options: readonly T[], current: T, direction: -1 | 1) {
  const index = options.indexOf(current);
  return options[(index + direction + options.length) % options.length];
}

function LayerSelector({ label, value, count, icon: Icon, enabled = false, onPrevious, onNext }: { label: string; value: string; count: string; icon: Icon; enabled?: boolean; onPrevious?: () => void; onNext?: () => void }) {
  return <div className={`creator-layer-selector ${enabled ? "creator-layer-selector--active" : ""}`}><span className="creator-layer-icon"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-[9px] font-black uppercase tracking-[.14em] text-[#76562d]">{label}</span><span className="mt-1 block truncate text-xs font-black text-[#47351f]">{value}</span></span><button type="button" aria-label={`Opção anterior de ${label}`} onClick={onPrevious} disabled={!enabled} className="creator-stone-arrow">‹</button><span className="w-9 text-center text-[9px] font-black text-[#86663a]">{count}</span><button type="button" aria-label={`Próxima opção de ${label}`} onClick={onNext} disabled={!enabled} className="creator-stone-arrow">›</button></div>;
}

export default function CharacterCreatorPage() {
  const router = useRouter();
  const [appearance, setAppearance] = useState<ManaSeedAppearance>(DEFAULT_MANA_SEED_APPEARANCE);
  const [name, setName] = useState("Seu Nome");
  const [bodyType, setBodyType] = useState<"hero" | "heroine">("hero");
  const [aura, setAura] = useState(auras[0]);
  const [activePreset, setActivePreset] = useState("farmer");
  const layers = useMemo(() => manaSeedLayersFor(appearance), [appearance]);
  const hairOptions = Object.keys(MANA_SEED_FREE.hairstyles) as ManaSeedAppearance["hair"][];
  const shirtOptions = Object.keys(MANA_SEED_FREE.shirts) as ManaSeedAppearance["shirt"][];
  const hatOptions = Object.keys(MANA_SEED_FREE.headwear) as ManaSeedAppearance["headwear"][];

  function rotateAppearance(part: keyof ManaSeedAppearance, direction: -1 | 1) {
    setActivePreset("");
    setAppearance((current) => {
      if (part === "hair") return { ...current, hair: cycle(hairOptions, current.hair, direction) };
      if (part === "shirt") return { ...current, shirt: cycle(shirtOptions, current.shirt, direction) };
      return { ...current, headwear: cycle(hatOptions, current.headwear, direction) };
    });
  }

  function selectPreset(preset: typeof presets[number]) {
    setAppearance(preset.appearance);
    setActivePreset(preset.id);
  }

  return <div className="creator-parchment min-h-screen"><GameNav /><main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-6 sm:py-9"><div className="creator-scroll-heading"><span>✦</span><p>Oficina de aventuras</p><span>✦</span></div><div className="mt-2 grid gap-5 xl:grid-cols-[285px_minmax(360px,1fr)_350px] xl:items-stretch">
    <section className="creator-ornate-panel p-4 sm:p-5" aria-label="Pre-sets de traje e classe"><header className="creator-panel-heading"><span>✦</span><div><p>PRE-SETS</p><small>TRAJES DO HERÓI</small></div><span>✦</span></header><p className="creator-panel-note mt-4">Escolha um conjunto para equipar o aventureiro de uma vez.</p><div className="mt-4 grid grid-cols-2 gap-3">{presets.map((preset) => { const Icon = preset.icon; const active = activePreset === preset.id; return <button type="button" key={preset.id} onClick={() => selectPreset(preset)} className={`creator-preset ${active ? "creator-preset--active" : ""}`}><span className="creator-preset-icon"><Icon className="h-7 w-7" /></span><span className="mt-2 block text-[10px] font-black uppercase tracking-wide">{preset.label}</span><span className="mt-1 block text-[8px] leading-tight opacity-75">{preset.helper}</span></button>; })}</div><div className="mt-6 border-t-2 border-[#756142] pt-5"><p className="creator-mini-heading">ESCOLHA SUA CLASSE</p><div className="mt-3 grid grid-cols-3 gap-2">{auras.map((option) => <button type="button" key={option.name} title={option.name} aria-label={`Classe ${option.name}`} onClick={() => setAura(option)} className={`creator-aura-option ${aura.name === option.name ? "creator-aura-option--active" : ""}`}><span style={{ background: `radial-gradient(circle at 35% 30%,#fff7c9 0 8%,${option.color} 10% 46%,#4e432b 48% 55%,${option.color} 57% 69%,transparent 70%)` }} /></button>)}</div><p className="mt-3 text-center text-[9px] font-black uppercase tracking-wider text-[#d5bd8a]">Classe ativa: {aura.name}</p></div><div className="mt-5 creator-free-note">O pacote atual fornece 2 cabelos, 2 camisas e 1 acessório. Novas camadas surgem quando houver novos sprites.</div></section>

    <section className="creator-stage" aria-label="Pré-visualização do personagem"><div className="creator-arcane-aura" style={{ "--aura-wash": aura.wash } as React.CSSProperties} /><div className="creator-rune-circle"><span>ᚠ</span><span>ᚢ</span><span>ᚦ</span><span>ᚨ</span></div><div role="img" aria-label={`Prévia de ${name || "novo herói"}`} className="mana-seed-sprite creator-full-sprite"><ManaSeedSpriteLayers frame={MANA_SEED_FREE.staticAvatarFrame} layers={layers} /></div><div className="creator-stone-pedestal"><div className="creator-pedestal-runes">ᚠ&nbsp;&nbsp;ᚢ&nbsp;&nbsp;ᚦ&nbsp;&nbsp;ᚨ&nbsp;&nbsp;ᚱ&nbsp;&nbsp;ᚲ&nbsp;&nbsp;ᚷ</div><div className="creator-pedestal-plaque">{name || "HERÓI SEM NOME"}</div></div><div className="creator-stage-caption"><span style={{ backgroundColor: aura.color }} /> Classe: {aura.name} <b>·</b> {bodyType === "hero" ? "Herói" : "Heroína"}</div></section>

    <section className="creator-ornate-panel p-4 sm:p-5" aria-label="Seletores de camadas"><header className="creator-panel-heading"><span>✦</span><div><p>CRIAR SEU HERÓI</p><small>CAMADAS DO SPRITE</small></div><span>✦</span></header><label className="mt-5 block"><span className="creator-mini-heading">NOME DO HERÓI</span><input value={name} maxLength={18} onChange={(event) => setName(event.target.value)} className="creator-parchment-input mt-2" /></label><div className="mt-4 flex items-center gap-3"><span className="creator-mini-heading">BASE</span><button type="button" onClick={() => setBodyType("hero")} aria-label="Base de herói" className={`creator-gender-button ${bodyType === "hero" ? "creator-gender-button--active" : ""}`}>♂</button><button type="button" onClick={() => setBodyType("heroine")} aria-label="Base de heroína" className={`creator-gender-button ${bodyType === "heroine" ? "creator-gender-button--active" : ""}`}>♀</button><span className="text-[9px] font-bold text-[#876841]">Base disponível: humano</span></div><div className="mt-5 grid gap-2"><LayerSelector label="Tom de pele" value="Natural" count="1/1" icon={FaceIcon} /><LayerSelector label="Estilo do cabelo" value={MANA_SEED_FREE.hairstyles[appearance.hair].label} count={`${hairOptions.indexOf(appearance.hair) + 1}/${hairOptions.length}`} icon={HairIcon} enabled onPrevious={() => rotateAppearance("hair", -1)} onNext={() => rotateAppearance("hair", 1)} /><LayerSelector label="Cor do cabelo" value="Original" count="1/1" icon={HairIcon} /><LayerSelector label="Cor dos olhos" value="Natural" count="1/1" icon={EyeIcon} /><LayerSelector label="Camisa" value={MANA_SEED_FREE.shirts[appearance.shirt].label} count={`${shirtOptions.indexOf(appearance.shirt) + 1}/${shirtOptions.length}`} icon={ShirtIcon} enabled onPrevious={() => rotateAppearance("shirt", -1)} onNext={() => rotateAppearance("shirt", 1)} /><LayerSelector label="Calça" value="Calça longa" count="1/1" icon={PantsIcon} /></div><div className="mt-5 border-t-2 border-[#b29261] pt-4"><p className="creator-mini-heading">EXTRAS / ACESSÓRIOS</p><div className="mt-3 grid grid-cols-4 gap-2"><button type="button" onClick={() => setAppearance((current) => ({ ...current, headwear: "none" }))} className={`creator-accessory ${appearance.headwear === "none" ? "creator-accessory--active" : ""}`} title="Sem acessório">×</button><button type="button" onClick={() => rotateAppearance("headwear", 1)} className={`creator-accessory ${appearance.headwear === "cowboyHat" ? "creator-accessory--active" : ""}`} title="Chapéu cowboy"><AccessoryIcon className="h-5 w-5" /></button><button type="button" disabled className="creator-accessory" title="Indisponível na amostra"><SparkIcon className="h-5 w-5" /></button><button type="button" disabled className="creator-accessory" title="Indisponível na amostra"><ShoeIcon className="h-5 w-5" /></button></div></div></section>
  </div><footer className="mt-6 flex items-center justify-between gap-4"><button type="button" onClick={() => router.push("/dashboard")} className="creator-navigation-button creator-navigation-button--back">‹ VOLTAR</button><p className="hidden text-center text-[10px] font-black uppercase tracking-[.16em] text-[#694b2b] sm:block">Escolhas atualizadas na prévia</p><button type="button" onClick={() => router.push("/dashboard")} className="creator-navigation-button creator-navigation-button--continue">CONTINUAR ›</button></footer></main></div>;
}
