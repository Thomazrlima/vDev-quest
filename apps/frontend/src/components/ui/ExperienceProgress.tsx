import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";

type ExperienceProgressProps = {
    level?: ReactNode;
    xp?: ReactNode;
    progress: number;
    showLevel?: boolean;
    showXp?: boolean;
    showProgress?: boolean;
    showLevelShadow?: boolean;
    levelLabel?: ReactNode;
    xpSuffix?: ReactNode;
    className?: string;
    infoClassName?: string;
    levelClassName?: string;
    levelLabelClassName?: string;
    levelValueClassName?: string;
    xpClassName?: string;
    progressClassName?: string;
    progressFillClassName?: string;
};

export function ExperienceProgress({ level, xp, progress, showLevel = true, showXp = true, showProgress = true, showLevelShadow = true, levelLabel = "Nível", xpSuffix = "XP", className, infoClassName, levelClassName, levelLabelClassName, levelValueClassName, xpClassName, progressClassName, progressFillClassName }: ExperienceProgressProps) {
    const reduceMotion = useReducedMotion();
    const progressRef = useRef<HTMLDivElement>(null);
    const progressInView = useInView(progressRef, { once: true, amount: 0.6 });
    const normalizedProgress = Math.min(100, Math.max(0, progress));
    const showProgressFill = reduceMotion || progressInView;

    return (
        <div className={cn("min-w-0", className)}>
            {showLevel || showXp ? (
                <div className={cn("flex items-baseline justify-between gap-3", infoClassName)}>
                    {showLevel ? (
                        <span className={cn("text-[.52rem] font-black uppercase tracking-[.1em] text-[var(--color-primary-light)]", levelClassName)}>
                            <span className={levelLabelClassName}>{typeof levelLabel === "string" || typeof levelLabel === "number" ? renderTextWithNumericFont(levelLabel) : levelLabel}</span>
                            <strong className={cn("ml-[5px] text-[.85rem] text-primary-light", showLevelShadow && "[text-shadow:2px_2px_0_var(--color-primary-dark)]", levelValueClassName)}>{typeof level === "string" || typeof level === "number" ? renderTextWithNumericFont(level) : level}</strong>
                        </span>
                    ) : null}
                    {showXp ? (
                        <b className={cn("whitespace-nowrap text-[.67rem] text-[var(--color-primary-light)]", xpClassName)}>
                            {typeof xp === "string" || typeof xp === "number" ? renderTextWithNumericFont(xp) : xp} {typeof xpSuffix === "string" || typeof xpSuffix === "number" ? renderTextWithNumericFont(xpSuffix) : xpSuffix}
                        </b>
                    ) : null}
                </div>
            ) : null}
            {showProgress ? (
                <div ref={progressRef} className={cn("mt-2 h-[13px] border-2 border-[var(--color-primary-dark)] bg-[var(--color-black)] p-[2px] shadow-[inset_2px_2px_0_var(--color-black)]", progressClassName)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalizedProgress}>
                    <motion.span key={normalizedProgress} initial={reduceMotion ? false : { scaleX: 0 }} animate={{ scaleX: showProgressFill ? 1 : 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className={cn("block h-full origin-left bg-[repeating-linear-gradient(90deg,var(--color-primary)_0_8px,var(--color-primary-light)_8px_12px)] shadow-[inset_0_2px_0_var(--color-primary-overlay)]", progressFillClassName)} style={{ width: `${normalizedProgress}%` }} />
                </div>
            ) : null}
        </div>
    );
}
