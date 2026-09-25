import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Logout } from "pixelarticons/react";
import { useAuth } from "@/auth/useAuth";
import { Logo } from "@/components/Logo";
import { GridIcon, MissionsNavIcon, ProfileNavIcon, RankingNavIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";

const items = [
    { href: "/ranking", label: "Ranking", icon: RankingNavIcon },
    { href: "/mural", label: "Mural", icon: GridIcon },
    { href: "/missions", label: "Missões", icon: MissionsNavIcon },
    { href: "/perfil", label: "Perfil", icon: ProfileNavIcon },
];

export function NavBar({ isManager = false }: { isManager?: boolean }) {
    const pathname = useRouterState({ select: (state) => state.location.pathname });
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const visibleItems = items.filter((item) => isManager || item.href !== "/missions");
    const activeItem = visibleItems.find(
        (item) =>
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.href === "/missions" && (pathname === "/moderation" || pathname.startsWith("/moderation/") || pathname === "/admin" || pathname.startsWith("/admin/"))) ||
            (item.href === "/perfil" && (pathname === "/characters" || pathname.startsWith("/characters/"))),
    );

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-primary-dark/70 bg-[rgb(15_14_14/94%)] backdrop-blur-md md:block">
                <div className="mx-auto hidden h-22 max-w-7xl grid-cols-[128px_minmax(0,1fr)_auto] items-center gap-6 px-6 md:grid">
                    <Logo href="/ranking" priority className="flex h-20 w-32 shrink-0 items-center justify-center" imageClassName="h-20 w-32" />
                    <nav aria-label="Navegação principal">
                        <Slider className="flex min-w-0 justify-self-end items-center gap-1" indicatorClassName="border-b-2 border-primary bg-primary-overlay" items={visibleItems} value={activeItem?.href ?? "/ranking"} getValue={(item) => item.href} onValueChange={(href) => navigate({ to: href })}>
                            {(item, { active, indicator, select }) => {
                                const Icon = item.icon;
                                return (
                                    <Button key={item.href} type="button" onClick={select} variant="ghost" className={`h-12 items-center gap-2 border-0 px-3 text-[12px] leading-none tracking-[.04em] lg:px-4 lg:text-[13px] ${active ? "text-primary-light" : "text-(--color-white-muted) hover:text-primary-light"}`} aria-current={active ? "page" : undefined}>
                                        {indicator}
                                        <Icon className="relative z-10 h-5 w-5 shrink-0" />
                                        <span className="relative z-10 leading-none">{item.label}</span>
                                    </Button>
                                );
                            }}
                        </Slider>
                    </nav>
                    <Button type="button" onClick={() => void signOut()} variant="secondary" className="h-10 px-3 py-2 text-[11px] text-primary-light">
                        <Logout className="h-4 w-4" aria-hidden="true" />
                        Sair
                    </Button>
                </div>
            </header>

            <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-black-muted bg-black-soft px-4 pb-[env(safe-area-inset-bottom)] md:hidden">
                <div className="mx-auto flex h-14 max-w-sm items-stretch">
                    <Slider className="flex min-w-0 flex-1 items-stretch justify-around" indicatorClassName="border-x-2 border-primary bg-primary-overlay" items={visibleItems} value={activeItem?.href ?? "/ranking"} getValue={(item) => item.href} onValueChange={(href) => navigate({ to: href })}>
                        {(item, { active, indicator, select }) => {
                            const Icon = item.icon;
                            return (
                                <Button key={item.href} type="button" onClick={select} variant="ghost" className={`h-full min-w-0 flex-1 flex-col items-center gap-1.5 border-x-2 border-y-0 px-1 py-1 text-[10px] leading-none tracking-wide ${active ? "text-primary-light" : "text-(--color-white-muted) hover:text-primary-light"}`} aria-current={active ? "page" : undefined}>
                                    {indicator}
                                    <Icon className="relative z-10 h-4 w-4 shrink-0" />
                                    <span className="relative z-10 leading-none">{item.label}</span>
                                </Button>
                            );
                        }}
                    </Slider>
                    <Button type="button" onClick={() => void signOut()} variant="ghost" className="h-full w-12 shrink-0 border-x-2 border-y-0 px-1 py-1 text-(--color-white-muted) hover:text-primary-light" aria-label="Sair da conta" title="Sair da conta">
                        <Logout className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Sair</span>
                    </Button>
                </div>
            </nav>
        </>
    );
}
