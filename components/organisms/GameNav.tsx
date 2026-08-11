"use client";

import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { CrownIcon, GridIcon, ScrollIcon } from "@/components/atoms/icons";

const items = [
  { href: "/ranking", label: "Ranking", icon: CrownIcon },
  { href: "/perfil", label: "Perfil", icon: GridIcon },
  { href: "/missions", label: "Missões", icon: ScrollIcon }
];

export function GameNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-4 border-[#201706] bg-[#0b0d0cf2] shadow-[0_5px_0_rgba(0,0,0,.55)] backdrop-blur-md">
      <div className="mx-auto grid h-[88px] max-w-7xl grid-cols-[112px_minmax(0,1fr)] items-center gap-2 px-3 sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-4 sm:px-6">
        <BrandLogo href="/ranking" priority className="flex h-20 w-28 shrink-0 items-center justify-center sm:w-32" imageClassName="h-[72px] w-28 sm:h-20 sm:w-32" />
        <nav className="flex min-w-0 justify-self-end items-center gap-0.5 sm:gap-1" aria-label="NavegaÃ§Ã£o principal">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <button key={item.href} onClick={() => router.push(item.href)} className={`flex h-12 items-center gap-2 border-2 px-2 text-[12px] font-black uppercase tracking-wider transition sm:px-3 lg:px-4 lg:text-[13px] ${active ? "border-gold bg-[#3a2a12] text-gold-light shadow-[3px_3px_0_#070806]" : "border-transparent text-[#a9a58f] hover:border-[#59421d] hover:text-cream"}`} aria-current={active ? "page" : undefined}>
                <Icon className="h-5 w-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
