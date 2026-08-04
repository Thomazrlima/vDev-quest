"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CrownIcon, GridIcon, LogoutIcon, ScrollIcon, SparkIcon } from "./icons";

const mainItems = [
  { href: "/ranking", label: "Ranking", icon: CrownIcon },
  { href: "/perfil", label: "Perfil", icon: GridIcon },
  { href: "/characters", label: "Personagem", icon: SparkIcon }
];

const managementItems = [
  { href: "/missions", label: "Missões", icon: ScrollIcon },
  { href: "/moderation", label: "Moderação", icon: SparkIcon }
];

export function GameNav() {
  const pathname = usePathname();
  const router = useRouter();

  function renderItem(item: (typeof mainItems)[number]) {
    const Icon = item.icon;
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return <button key={item.href} onClick={() => router.push(item.href)} className={`flex h-10 items-center gap-2 border-2 px-2 text-[10px] font-black uppercase tracking-wider transition sm:px-3 lg:px-4 lg:text-[11px] ${active ? "border-gold bg-[#3a2a12] text-gold-light shadow-[3px_3px_0_#070806]" : "border-transparent text-[#a9a58f] hover:border-[#59421d] hover:text-cream"}`} aria-current={active ? "page" : undefined}><Icon className="h-4 w-4" /><span className="hidden lg:inline">{item.label}</span></button>;
  }

  return <header className="sticky top-0 z-50 border-b-4 border-[#201706] bg-[#0b0d0cf2] shadow-[0_5px_0_rgba(0,0,0,.55)] backdrop-blur-md"><div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6"><button onClick={() => router.push("/ranking")} className="group flex shrink-0 items-center" aria-label="Ir para o ranking"><Image src="/quest-logo.png" alt="v(dev) Quest" width={512} height={512} className="h-14 w-20 object-contain object-center transition group-hover:brightness-110 sm:w-24" priority /></button><nav className="flex min-w-0 items-center gap-0.5 sm:gap-1" aria-label="Navegação principal"><div className="flex items-center gap-0.5 sm:gap-1">{mainItems.map(renderItem)}</div><span className="mx-1 h-7 w-px bg-[#493418] sm:mx-2" aria-hidden="true" /><div className="flex items-center gap-0.5 sm:gap-1" aria-label="Gestão">{managementItems.map(renderItem)}</div><span className="mx-1 h-7 w-px bg-[#493418] sm:mx-2" aria-hidden="true" /><button onClick={() => router.push("/login")} className="flex h-10 items-center gap-2 border-2 border-transparent px-2 text-[10px] font-black uppercase tracking-wider text-[#9d8d79] transition hover:border-[#6e3827] hover:bg-[#2d1712] hover:text-[#ef9875] sm:px-3 lg:text-[11px]"><LogoutIcon className="h-4 w-4" /><span className="hidden lg:inline">Sair</span></button></nav></div></header>;
}
