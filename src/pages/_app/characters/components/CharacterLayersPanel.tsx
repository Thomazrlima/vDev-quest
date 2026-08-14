import { AccessoryIcon, EyeIcon, FaceIcon, HairIcon, PantsIcon, ShirtIcon, ShoeIcon, SparkIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LayerSelector } from "./LayerSelector";
import { MANA_SEED_FREE } from "@/mocks/data/mana-seed";
import type { BodyType, ManaSeedAppearance } from "@/types/character";

export function CharacterLayersPanel({ name, bodyType, appearance, onNameChange, onBodyTypeChange, onRotate, onHeadwearChange }: { name: string; bodyType: BodyType; appearance: ManaSeedAppearance; onNameChange: (value: string) => void; onBodyTypeChange: (value: BodyType) => void; onRotate: (part: keyof ManaSeedAppearance, direction: -1 | 1) => void; onHeadwearChange: (value: ManaSeedAppearance["headwear"]) => void }) {
    const hairs = Object.keys(MANA_SEED_FREE.hairstyles) as ManaSeedAppearance["hair"][];
    const shirts = Object.keys(MANA_SEED_FREE.shirts) as ManaSeedAppearance["shirt"][];
    return (
        <section className="border-[5px] border-[var(--color-orange-dark)] bg-[linear-gradient(135deg,var(--color-black-overlay),var(--color-black-overlay))] p-4 shadow-[0_0_0_3px_var(--color-orange-dark),6px_7px_0_var(--color-black-overlay),inset_0_0_0_2px_var(--color-orange-overlay)] sm:p-5" aria-label="Seletores de camadas">
            <header className="flex items-center justify-between border-b-2 border-[var(--color-orange-dark)] pb-[.7rem] text-center text-white">
                <span>✦</span>
                <div>
                    <p className="m-0 text-[.78rem] font-black tracking-[.13em]">CRIAR SEU HERÓI</p>
                    <small className="mt-[.2rem] block text-[.5rem] font-black tracking-[.16em] text-[var(--color-orange)]">CAMADAS DO SPRITE</small>
                </div>
                <span>✦</span>
            </header>
            <Input label="Nome do herói" value={name} maxLength={18} onChange={(event) => onNameChange(event.target.value)} containerClassName="mt-5" className="border-[3px] p-[.7rem] text-[.85rem] font-black" />
            <div className="mt-4 flex items-center gap-3">
                <span className="text-[.56rem] font-black uppercase tracking-[.14em] text-[var(--color-orange)]">BASE</span>
                {(["hero", "heroine"] as const).map((type) => (
                    <Button
                        key={type}
                        type="button"
                        onClick={() => onBodyTypeChange(type)}
                        aria-label={type === "hero" ? "Base de herói" : "Base de heroína"}
                        className={`h-9 w-9 rounded-full border-[3px] bg-[var(--color-black)] p-0 text-[1.1rem] shadow-[2px_2px_0_var(--color-black)] ${bodyType === type ? "border-primary bg-[var(--color-orange-dark)] text-primary-light shadow-[0_0_0_2px_var(--color-orange-dark),2px_2px_0_var(--color-black)]" : "border-[var(--color-orange-dark)] text-[var(--color-white-muted)]"}`}
                    >
                        {type === "hero" ? "♂" : "♀"}
                    </Button>
                ))}
                <small className="text-[9px] font-bold text-[var(--color-black-muted)]">Base disponível: humano</small>
            </div>
            <div className="mt-5 grid gap-2">
                <LayerSelector label="Tom de pele" value="Natural" count="1/1" icon={FaceIcon} />
                <LayerSelector label="Estilo do cabelo" value={MANA_SEED_FREE.hairstyles[appearance.hair].label} count={`${hairs.indexOf(appearance.hair) + 1}/${hairs.length}`} icon={HairIcon} enabled onPrevious={() => onRotate("hair", -1)} onNext={() => onRotate("hair", 1)} />
                <LayerSelector label="Cor do cabelo" value="Original" count="1/1" icon={HairIcon} />
                <LayerSelector label="Cor dos olhos" value="Natural" count="1/1" icon={EyeIcon} />
                <LayerSelector label="Camisa" value={MANA_SEED_FREE.shirts[appearance.shirt].label} count={`${shirts.indexOf(appearance.shirt) + 1}/${shirts.length}`} icon={ShirtIcon} enabled onPrevious={() => onRotate("shirt", -1)} onNext={() => onRotate("shirt", 1)} />
                <LayerSelector label="Calça" value="Calça longa" count="1/1" icon={PantsIcon} />
            </div>
            <div className="mt-5 border-t-2 border-[var(--color-orange-dark)] pt-4">
                <p className="text-[.56rem] font-black uppercase tracking-[.14em] text-[var(--color-orange)]">EXTRAS / ACESSÓRIOS</p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                    <Button
                        type="button"
                        onClick={() => onHeadwearChange("none")}
                        variant="ghost"
                        className={`aspect-square border-2 bg-[var(--color-black)] p-0 text-[var(--color-primary)] shadow-[inset_2px_2px_0_var(--color-white-overlay),2px_2px_0_var(--color-black)] ${appearance.headwear === "none" ? "border-primary bg-[var(--color-orange-dark)] text-primary-light shadow-[0_0_0_2px_var(--color-orange-dark),2px_2px_0_var(--color-black)]" : "border-[var(--color-orange-dark)]"}`}
                        title="Sem acessório"
                    >
                        ×
                    </Button>
                    <Button
                        type="button"
                        onClick={() => onHeadwearChange("cowboyHat")}
                        variant="ghost"
                        className={`aspect-square border-2 bg-[var(--color-black)] p-0 text-[var(--color-primary)] shadow-[inset_2px_2px_0_var(--color-white-overlay),2px_2px_0_var(--color-black)] ${appearance.headwear === "cowboyHat" ? "border-primary bg-[var(--color-orange-dark)] text-primary-light shadow-[0_0_0_2px_var(--color-orange-dark),2px_2px_0_var(--color-black)]" : "border-[var(--color-orange-dark)]"}`}
                        title="Chapéu cowboy"
                    >
                        <AccessoryIcon className="h-5 w-5" />
                    </Button>
                    <Button type="button" inactive variant="ghost" className="aspect-square border-2 border-[var(--color-orange-dark)] bg-[var(--color-black)] p-0 text-[var(--color-primary)] opacity-30 shadow-[inset_2px_2px_0_var(--color-white-overlay),2px_2px_0_var(--color-black)]" title="Indisponível na amostra">
                        <SparkIcon className="h-5 w-5" />
                    </Button>
                    <Button type="button" inactive variant="ghost" className="aspect-square border-2 border-[var(--color-orange-dark)] bg-[var(--color-black)] p-0 text-[var(--color-primary)] opacity-30 shadow-[inset_2px_2px_0_var(--color-white-overlay),2px_2px_0_var(--color-black)]" title="Indisponível na amostra">
                        <ShoeIcon className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
