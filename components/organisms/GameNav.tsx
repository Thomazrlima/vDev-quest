"use client";

import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { CrownIcon, GridIcon, LogoutIcon, ScrollIcon } from "@/components/atoms/icons";

const items = [
  { href: "/ranking", label: "Ranking", icon: CrownIcon },
  { href: "/perfil", label: "Perfil", icon: GridIcon },
  { href: "/missions", label: "Missões", icon: ScrollIcon }
];

export function GameNav() {
  const pathname = usePathname();
  const router = useRouter();
  return <header className="sticky top-0 z-50 border-b-4 border-[#201706] bg-[#0b0d0cf2] shadow-[0_5px_0_rgba(0,0,0,.55)] backdrop-blur-md"><div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6"><BrandLogo href="/ranking" priority className="group flex shrink-0 items-center" imageClassName="h-14 w-20 transition group-hover:brightness-110 sm:w-24" /><nav className="flex min-w-0 items-center gap-0.5 sm:gap-1" aria-label="Navegação principal">{items.map((item) => { const Icon = item.icon; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <button key={item.href} onClick={() => router.push(item.href)} className={`flex h-10 items-center gap-2 border-2 px-2 text-[10px] font-black uppercase tracking-wider transition sm:px-3 lg:px-4 lg:text-[11px] ${active ? "border-gold bg-[#3a2a12] text-gold-light shadow-[3px_3px_0_#070806]" : "border-transparent text-[#a9a58f] hover:border-[#59421d] hover:text-cream"}`} aria-current={active ? "page" : undefined}><Icon className="h-4 w-4" /><span className="hidden sm:inline">{item.label}</span></button>; })}<span className="mx-1 h-7 w-px bg-[#493418] sm:mx-2" aria-hidden="true" /><button onClick={() => router.push("/login")} className="flex h-10 items-center gap-2 border-2 border-transparent px-2 text-[10px] font-black uppercase tracking-wider text-[#9d8d79] transition hover:border-[#6e3827] hover:bg-[#2d1712] hover:text-[#ef9875] sm:px-3 lg:text-[11px]"><LogoutIcon className="h-4 w-4" /><span className="hidden lg:inline">Sair</span></button></nav></div></header>;
}
