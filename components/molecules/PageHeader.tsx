import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, action, centered = false }: { eyebrow: string; title: string; description?: string; action?: ReactNode; centered?: boolean }) {
  return <header className={centered ? "text-center" : "flex flex-col justify-between gap-5 sm:flex-row sm:items-end"}><div><p className="eyebrow">{eyebrow}</p><h1 className={`pixel-title mt-2 text-3xl sm:text-4xl ${centered ? "mx-auto lg:text-5xl" : ""}`}>{title}</h1>{description ? <p className={`mt-3 text-sm leading-relaxed text-[#9f9a89] ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>{description}</p> : null}</div>{action}</header>;
}
