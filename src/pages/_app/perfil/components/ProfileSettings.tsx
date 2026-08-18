import { MapPin, Menu } from "pixelarticons/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import type { NavigationMode } from "@/utils/navigation-preference";
import { useNavigationMode } from "@/utils/use-navigation-mode";

const OPTIONS: { value: NavigationMode; label: string; helper: string; icon: typeof Menu }[] = [
    { value: "map", label: "Navegação pelo mapa", helper: "Ande com o herói e entre pelas placas de cada destino.", icon: MapPin },
    { value: "navbar", label: "Navegação tradicional", helper: "Menu fixo com Ranking, Missões e Perfil sempre à mão.", icon: Menu },
];

export function ProfileSettings() {
    const [mode, setMode] = useNavigationMode();

    return (
        <Card as="section" className={cn("p-5 sm:p-8", HALL_PANEL)} aria-labelledby="profile-settings-title">
            <Eyebrow className="mb-2">Configurações</Eyebrow>
            <Heading as="h2" id="profile-settings-title" size="sm">
                Como você quer navegar
            </Heading>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white-muted">A escolha vale para todas as telas e fica guardada neste navegador.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2" role="group" aria-label="Modo de navegação">
                {OPTIONS.map((option) => {
                    const active = mode === option.value;
                    const Icon = option.icon;
                    return (
                        <Button key={option.value} type="button" onClick={() => setMode(option.value)} aria-pressed={active} variant="secondary" className={cn("h-full flex-col items-start justify-start gap-2 border-primary-dark px-4 py-4 text-left tracking-[.12em] text-primary-light", active && "border-primary bg-primary-overlay")}>
                            <span className="flex items-center gap-2 text-[.7rem]">
                                <Icon className="h-5 w-5 shrink-0" />
                                {option.label}
                            </span>
                            <span className={cn("text-[10px] font-bold normal-case leading-[1.5] tracking-normal", active ? "text-primary-light" : "text-white-muted")}>{option.helper}</span>
                            <span aria-hidden="true" className={cn("mt-1 text-[9px] font-black uppercase tracking-[.16em]", active ? "text-primary-light" : "text-primary")}>
                                {active ? "◆ Em uso" : "◇ Usar este"}
                            </span>
                        </Button>
                    );
                })}
            </div>
        </Card>
    );
}
