"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CharacterLayersPanel } from "@/components/organisms/CharacterLayersPanel";
import { CharacterPresetPanel } from "@/components/organisms/CharacterPresetPanel";
import { CharacterPreview } from "@/components/organisms/CharacterPreview";
import { LobbyReturnLink } from "@/components/atoms/LobbyReturnLink";
import { CHARACTER_AURAS } from "@/data/character-options";
import { DEFAULT_MANA_SEED_APPEARANCE, MANA_SEED_FREE } from "@/data/mana-seed";
import type { BodyType, CharacterPreset, ManaSeedAppearance } from "@/types/character";
import { readStoredCharacter, saveStoredCharacter } from "@/utils/character-storage";
import { getManaSeedLayers } from "@/utils/mana-seed";

function cycle<T extends string>(options: readonly T[], current: T, direction: -1 | 1) {
  return options[(options.indexOf(current) + direction + options.length) % options.length];
}

export function CharacterCreatorTemplate() {
  const router = useRouter();
  const [appearance, setAppearance] = useState<ManaSeedAppearance>(DEFAULT_MANA_SEED_APPEARANCE);
  const [name, setName] = useState("Seu Nome");
  const [bodyType, setBodyType] = useState<BodyType>("hero");
  const [aura, setAura] = useState(CHARACTER_AURAS[0]);
  const [activePreset, setActivePreset] = useState("farmer");
  const [storageReady, setStorageReady] = useState(false);
  const layers = useMemo(() => getManaSeedLayers(appearance), [appearance]);

  useEffect(() => {
    const storedCharacter = readStoredCharacter();
    setAppearance(storedCharacter.appearance);
    setName(storedCharacter.name);
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (storageReady) saveStoredCharacter({ appearance, name });
  }, [appearance, name, storageReady]);

  function rotate(part: keyof ManaSeedAppearance, direction: -1 | 1) {
    setActivePreset("");
    setAppearance((current) => {
      const options = Object.keys(part === "hair" ? MANA_SEED_FREE.hairstyles : part === "shirt" ? MANA_SEED_FREE.shirts : MANA_SEED_FREE.headwear) as ManaSeedAppearance[typeof part][];
      return { ...current, [part]: cycle(options, current[part], direction) };
    });
  }

  function selectPreset(preset: CharacterPreset) { setAppearance(preset.appearance); setActivePreset(preset.id); }

  return <div className="creator-parchment min-h-screen"><LobbyReturnLink /><main className="mx-auto max-w-[1480px] px-4 pb-7 pt-20 sm:px-6 sm:pb-9"><div className="creator-scroll-heading"><span>✦</span><p>Oficina de aventuras</p><span>✦</span></div><div className="mt-2 grid gap-5 xl:grid-cols-[285px_minmax(360px,1fr)_350px] xl:items-stretch"><CharacterPresetPanel activePreset={activePreset} aura={aura} onPreset={selectPreset} onAura={setAura} /><CharacterPreview name={name} aura={aura} bodyType={bodyType} layers={layers} /><CharacterLayersPanel name={name} bodyType={bodyType} appearance={appearance} onNameChange={setName} onBodyTypeChange={setBodyType} onRotate={rotate} onHeadwearChange={(headwear) => { setActivePreset(""); setAppearance((current) => ({ ...current, headwear })); }} /></div><footer className="mt-6 flex items-center justify-between gap-4"><button type="button" onClick={() => router.push("/perfil")} className="creator-navigation-button creator-navigation-button--back">‹ VOLTAR</button><p className="hidden text-center text-[10px] font-black uppercase tracking-[.16em] text-[#694b2b] sm:block">Escolhas atualizadas na prévia</p><button type="button" onClick={() => router.push("/perfil")} className="creator-navigation-button creator-navigation-button--continue">CONTINUAR ›</button></footer></main></div>;
}
