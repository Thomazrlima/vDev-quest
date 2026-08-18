import type { ReactNode } from "react";
import { cn } from "@/lib/tailwind";

/**
 * A arte vai de ponta a ponta, então a folga que o layout reserva para o atalho flutuante de
 * volta ao vilarejo apareceria aqui como uma faixa da paisagem por cima da parede. Sobe-se por
 * baixo dela cancelando a medida — com a barra de navegação ligada ela é zero e nada muda.
 */
export const BLEED_UNDER_RETURN_LINK = "mt-[calc(var(--lobby-return-allowance,0px)*-1)]";

/** E o conteúdo desce de novo, senão o primeiro texto nasce atrás do atalho. */
export const CLEAR_RETURN_LINK = "pt-[calc(var(--lobby-return-allowance,0px)+2rem)]";

/** A parede de pedra do Hall da Fama, reaproveitada nas telas que seguem o mesmo visual. */
export function StoneWall({ className, children }: { className?: string; children: ReactNode }) {
    return <section className={cn("flex-1 bg-[linear-gradient(var(--color-black-overlay),var(--color-black-overlay)),url('/images/backgrounds/parede-pedra.png')] bg-cover bg-fixed bg-position-[center_75%] px-4 pb-9 sm:px-6 sm:pb-13", CLEAR_RETURN_LINK, className)}>{children}</section>;
}

/** O painel do ranking: moldura dourada grossa sobre a pedra, que ainda aparece por trás. */
export const HALL_PANEL = "border-4 border-primary bg-black-overlay";
