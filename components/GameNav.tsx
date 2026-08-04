"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CrownIcon, GridIcon, LogoutIcon, ScrollIcon, SparkIcon } from "./icons";

const items = [
  { href: "/dashboard", label: "Painel", icon: GridIcon },
  { href: "/moderation", label: "Moderação", icon: SparkIcon },
  { href: "/missions", label: "Missões", icon: ScrollIcon },
  { href: "/characters", label: "Personagem", icon: SparkIcon },
  { href: "/ranking", label: "Ranking", icon: CrownIcon }
];

export function GameNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b-4 border-[#201706] bg-[#0b0d0cf2] shadow-[0_5px_0_rgba(0,0,0,.55)] backdrop-blur-md">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <button onClick={() => router.push("/dashboard")} className="group flex items-center gap-2" aria-label="Ir para o painel">
          <Image src="/vdev-quest-logo.png" alt="v(dev) Quest" width={512} height={512} className="h-14 w-24 object-contain object-center transition group-hover:brightness-110 sm:w-28" priority />
        </button>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Navegação principal">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex h-10 items-center gap-2 border-2 px-3 text-[11px] font-black uppercase tracking-wider transition sm:px-4 ${active ? "border-gold bg-[#3a2a12] text-gold-light shadow-[3px_3px_0_#070806]" : "border-transparent text-[#a9a58f] hover:border-[#59421d] hover:text-cream"}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">{item.label}</span>
              </button>
            );
          })}
          <span className="mx-1 h-7 w-px bg-[#493418]" />
          <button
            onClick={() => router.push("/login")}
            className="flex h-10 items-center gap-2 border-2 border-transparent px-2 text-[11px] font-black uppercase tracking-wider text-[#9d8d79] transition hover:border-[#6e3827] hover:bg-[#2d1712] hover:text-[#ef9875] sm:px-3"
          >
            <LogoutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
