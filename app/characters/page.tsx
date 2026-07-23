"use client";

import { useMemo, useState, type ComponentType, type SVGProps } from "react";
import { GameNav } from "@/components/GameNav";
import { ManaSeedSpriteLayers } from "@/components/ManaSeedSpriteLayers";
import {
  AccessoryIcon,
  EyeIcon,
  FaceIcon,
  HairIcon,
  PantsIcon,
  ShirtIcon,
  ShoeIcon,
  SparkIcon
} from "@/components/icons";
import {
  DEFAULT_MANA_SEED_APPEARANCE,
  MANA_SEED_FREE,
  type ManaSeedAppearance,
  manaSeedLayersFor
} from "@/lib/manaSeed";

type CategoryCardProps = {
  title: string;
  helper: string;
  value: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  canChange?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
};

function CategoryCard({ title, helper, value, icon: Icon, canChange = false, onPrevious, onNext }: CategoryCardProps) {
  return (
    <article className={`creator-category ${canChange ? "creator-category--active" : ""}`}>
      <div className="creator-category-icon"><Icon className="h-6 w-6" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#c89a46]">{title}</p>
        <p className="mt-1 truncate text-sm font-black text-[#ede0bd]">{value}</p>
        <p className="mt-1 text-[9px] leading-relaxed text-[#817d70]">{helper}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={onPrevious} disabled={!canChange} className="creator-arrow" aria-label={`Alternativa anterior de ${title}`}>◀</button>
        <button type="button" onClick={onNext} disabled={!canChange} className="creator-arrow" aria-label={`Próxima alternativa de ${title}`}>▶</button>
      </div>
    </article>
  );
}

function cycle<T extends string>(options: readonly T[], current: T, direction: -1 | 1) {
  const index = options.indexOf(current);
  return options[(index + direction + options.length) % options.length];
}

export default function CharacterCreatorPage() {
  const [appearance, setAppearance] = useState<ManaSeedAppearance>(DEFAULT_MANA_SEED_APPEARANCE);
  const [name, setName] = useState("RafaelDev");
  const [saved, setSaved] = useState(false);
  const layers = useMemo(() => manaSeedLayersFor(appearance), [appearance]);

  const rotateAppearance = (part: keyof ManaSeedAppearance, direction: -1 | 1) => {
    setSaved(false);
    setAppearance((current) => {
      if (part === "hair") {
        const options = Object.keys(MANA_SEED_FREE.hairstyles) as ManaSeedAppearance["hair"][];
        return { ...current, hair: cycle(options, current.hair, direction) };
      }
      if (part === "shirt") {
        const options = Object.keys(MANA_SEED_FREE.shirts) as ManaSeedAppearance["shirt"][];
        return { ...current, shirt: cycle(options, current.shirt, direction) };
      }
      const options = Object.keys(MANA_SEED_FREE.headwear) as ManaSeedAppearance["headwear"][];
      return { ...current, headwear: cycle(options, current.headwear, direction) };
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_15%,rgba(126,74,18,.16),transparent_32%),linear-gradient(rgba(7,8,7,.9),rgba(7,8,7,.98)),url('/art/quest-landscape.png')] bg-cover bg-fixed bg-center">
      <GameNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="text-center">
          <p className="eyebrow">Oficina da guilda</p>
          <h1 className="pixel-title mt-3 text-3xl sm:text-4xl">Criador de personagem</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#999483]">Defina a identidade do aventureiro e acompanhe cada alteração na prévia.</p>
        </header>

        <div className="mt-10 grid gap-7 xl:grid-cols-[minmax(360px,.9fr)_minmax(0,1.1fr)]">
          <section className="pixel-panel flex min-h-[610px] flex-col overflow-hidden p-5 sm:p-8" aria-label="Prévia do personagem">
            <div className="flex items-start justify-between gap-4 border-b-2 border-[#4c371b] pb-5">
              <div>
                <p className="eyebrow">Prévia central</p>
                <h2 className="mt-2 text-xl font-black text-[#efdfbb]">{name || "Novo aventureiro"}</h2>
              </div>
              <span className="grid h-10 w-10 place-items-center border-2 border-[#855f21] bg-[#251d10] text-gold-light shadow-[3px_3px_0_#050605]"><SparkIcon className="h-5 w-5" /></span>
            </div>

            <div className="relative grid flex-1 place-items-end py-8">
              <span className="absolute bottom-10 h-12 w-56 rounded-[50%] bg-black/65 blur-sm" />
              <div role="img" aria-label="Prévia em corpo inteiro do personagem" className="mana-seed-sprite relative z-10 h-80 w-80 overflow-visible sm:h-96 sm:w-96">
                <ManaSeedSpriteLayers frame={MANA_SEED_FREE.staticAvatarFrame} layers={layers} />
              </div>
            </div>

            <div className="grid gap-3 border-t-2 border-[#4c371b] pt-5 sm:grid-cols-2">
              <div className="border-2 border-[#523d1d] bg-[#10130f] px-4 py-3"><p className="eyebrow">Identidade</p><p className="mt-1 text-sm font-black text-[#e8d9b6]">{name || "Sem nome"}</p></div>
              <div className="border-2 border-[#523d1d] bg-[#10130f] px-4 py-3"><p className="eyebrow">Base</p><p className="mt-1 text-sm font-black text-[#e8d9b6]">Humano · Frame 048</p></div>
            </div>
          </section>

          <section className="pixel-panel p-5 sm:p-8" aria-label="Opções de personalização">
            <div className="flex flex-col justify-between gap-5 border-b-2 border-[#4c371b] pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Personalização</p>
                <h2 className="mt-2 text-xl font-black text-[#efdfbb]">Escolha o seu visual</h2>
              </div>
              <label className="block sm:w-56"><span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#c89a46]">Nome do personagem</span><input value={name} maxLength={18} onChange={(event) => { setSaved(false); setName(event.target.value); }} className="creator-name-input w-full" /></label>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <CategoryCard title="Cabelo" value={MANA_SEED_FREE.hairstyles[appearance.hair].label} helper="Camada 13hair disponível" icon={HairIcon} canChange onPrevious={() => rotateAppearance("hair", -1)} onNext={() => rotateAppearance("hair", 1)} />
              <CategoryCard title="Rosto" value="Humano" helper="Uma base disponível na amostra" icon={FaceIcon} />
              <CategoryCard title="Olhos" value="Padrão" helper="Variação não incluída no Free Sample" icon={EyeIcon} />
              <CategoryCard title="Roupa" value={MANA_SEED_FREE.shirts[appearance.shirt].label} helper="Camada 05shrt disponível" icon={ShirtIcon} canChange onPrevious={() => rotateAppearance("shirt", -1)} onNext={() => rotateAppearance("shirt", 1)} />
              <CategoryCard title="Calça" value="Calça longa" helper="Uma peça disponível na amostra" icon={PantsIcon} />
              <CategoryCard title="Calçado" value="Sapatos" helper="Uma peça disponível na amostra" icon={ShoeIcon} />
              <CategoryCard title="Acessório" value={MANA_SEED_FREE.headwear[appearance.headwear].label} helper="Camada 14head disponível" icon={AccessoryIcon} canChange onPrevious={() => rotateAppearance("headwear", -1)} onNext={() => rotateAppearance("headwear", 1)} />
            </div>

            <div className="mt-6 flex flex-col justify-between gap-4 border-t-2 border-[#4c371b] pt-6 sm:flex-row sm:items-center">
              <p className="max-w-sm text-[10px] leading-relaxed text-[#817d70]">As setas ficam ativas somente quando há alternativas reais no pacote gratuito. Cada escolha atualiza a prévia imediatamente.</p>
              <button type="button" onClick={() => setSaved(true)} className="pixel-button h-12 shrink-0 px-5 py-3 text-[10px]">{saved ? "Visual equipado" : "Equipar visual"}</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
