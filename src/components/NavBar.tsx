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
    const activeItem = items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 bg-(--color-black) backdrop-blur-md">
                <div className="flex h-28 items-center justify-center px-4 md:hidden">
                    <Logo href="/ranking" priority className="flex h-26 w-40 items-center justify-center" imageClassName="h-26 w-40" />
                </div>
                <div className="mx-auto hidden h-22 max-w-7xl grid-cols-[128px_minmax(0,1fr)] items-center gap-4 px-6 md:grid">
                    <Logo href="/ranking" priority className="flex h-20 w-32 shrink-0 items-center justify-center" imageClassName="h-20 w-32" />
                    <nav aria-label="Navegação principal">
                        <Slider className="flex min-w-0 justify-self-end items-center gap-1" indicatorClassName="border-2 border-primary bg-black-soft shadow-[3px_3px_0_var(--color-black)]" items={items} value={activeItem?.href ?? "/ranking"} getValue={(item) => item.href} onValueChange={(href) => navigate({ to: href })}>
                            {(item, { active, indicator, select }) => {
                                const Icon = item.icon;
                                return (
                                    <Button key={item.href} type="button" onClick={select} variant="ghost" className={`h-12 gap-2 border-2 px-3 text-[12px] uppercase tracking-wider lg:px-4 lg:text-[13px] ${active ? "border-transparent text-primary-light" : "border-transparent text-(--color-white-muted) hover:border-transparent hover:shadow-[inset_0_0_0_2px_var(--color-primary)] hover:text-(--color-white-muted)"}`} aria-current={active ? "page" : undefined}>
                                        {indicator}
                                        <Icon className="relative z-10 h-5 w-5" />
                                        <span className="relative z-10">{item.label}</span>
                                    </Button>
                                );
                            }}
                        </Slider>
                    </nav>
                </div>
            </header>

            <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-primary-dark bg-black-soft/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
                <Slider className="mx-auto flex h-22 max-w-md items-stretch justify-around" indicatorClassName="border-x-2 border-primary bg-primary-overlay" items={items} value={activeItem?.href ?? "/ranking"} getValue={(item) => item.href} onValueChange={(href) => navigate({ to: href })}>
                    {(item, { active, indicator, select }) => {
                        const Icon = item.icon;
                        return (
                            <Button key={item.href} type="button" onClick={select} variant="ghost" className={`h-full min-w-0 flex-1 flex-col gap-1 border-x-2 border-y-0 px-2 py-2 text-[10px] tracking-wide ${active ? "text-primary-light" : "text-(--color-white-muted) hover:text-primary-light"}`} aria-current={active ? "page" : undefined}>
                                {indicator}
                                <Icon className="relative z-10 h-6 w-6" />
                                <span className="relative z-10 leading-none">{item.label}</span>
                            </Button>
                        );
                    }}
                </Slider>
            </nav>
        </>
    );
}
