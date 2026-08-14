import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { MissionsNavIcon, ProfileNavIcon, RankingNavIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";

const items = [
    { href: "/ranking", label: "Ranking", icon: RankingNavIcon },
    { href: "/missions", label: "Missões", icon: MissionsNavIcon },
    { href: "/perfil", label: "Perfil", icon: ProfileNavIcon },
];

export function NavBar() {
    const pathname = useRouterState({ select: (state) => state.location.pathname });
    const navigate = useNavigate();
    const activeItem = items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === "/perfil" && (pathname === "/characters" || pathname.startsWith("/characters/"))));

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 hidden bg-(--color-black) backdrop-blur-md md:block">
                <div className="mx-auto hidden h-22 max-w-7xl grid-cols-[128px_minmax(0,1fr)] items-center gap-4 px-6 md:grid">
                    <Logo href="/ranking" priority className="flex h-20 w-32 shrink-0 items-center justify-center" imageClassName="h-20 w-32" />
                    <nav aria-label="Navegação principal">
                        <Slider className="flex min-w-0 justify-self-end items-center gap-1" indicatorClassName="border-2 border-primary bg-black-soft shadow-[3px_3px_0_var(--color-black)]" items={items} value={activeItem?.href ?? "/ranking"} getValue={(item) => item.href} onValueChange={(href) => navigate({ to: href })}>
                            {(item, { active, indicator, select }) => {
                                const Icon = item.icon;
                                return (
                                    <Button key={item.href} type="button" onClick={select} variant="ghost" className={`h-12 items-center gap-2 border-2 px-3 text-[12px] uppercase leading-none tracking-wider lg:px-4 lg:text-[13px] ${active ? "border-transparent text-primary-light" : "border-transparent text-(--color-white-muted) hover:border-transparent hover:shadow-[inset_0_0_0_2px_var(--color-primary)] hover:text-(--color-white-muted)"}`} aria-current={active ? "page" : undefined}>
                                        {indicator}
                                        <Icon className="relative z-10 h-5 w-5 shrink-0" />
                                        <span className="relative z-10 leading-none">{item.label}</span>
                                    </Button>
                                );
                            }}
                        </Slider>
                    </nav>
                </div>
            </header>

            <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-black-muted bg-black-soft px-4 pb-[env(safe-area-inset-bottom)] md:hidden">
                <Slider className="mx-auto flex h-14 max-w-xs items-stretch justify-around" indicatorClassName="border-x-2 border-primary bg-primary-overlay" items={items} value={activeItem?.href ?? "/ranking"} getValue={(item) => item.href} onValueChange={(href) => navigate({ to: href })}>
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
            </nav>
        </>
    );
}
