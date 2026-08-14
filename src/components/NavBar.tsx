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
        <header className="fixed inset-x-0 top-0 z-50 bg-(--color-black) backdrop-blur-md">
            <div className="mx-auto grid h-22 max-w-7xl grid-cols-[112px_minmax(0,1fr)] items-center gap-2 px-3 sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-4 sm:px-6">
                <Logo href="/ranking" priority className="flex h-20 w-28 shrink-0 items-center justify-center sm:w-32" imageClassName="h-[72px] w-28 sm:h-20 sm:w-32" />
                <nav aria-label="Navegação principal">
                    <Slider className="flex min-w-0 justify-self-end items-center gap-0.5 sm:gap-1" indicatorClassName="border-2 border-primary bg-orange-dark shadow-[3px_3px_0_var(--color-black)]" items={items} value={activeItem?.href ?? "/ranking"} getValue={(item) => item.href} onValueChange={(href) => navigate({ to: href })}>
                        {(item, { active, indicator, select }) => {
                            const Icon = item.icon;
                            return (
                                <Button key={item.href} type="button" onClick={select} variant="ghost" className={`h-12 gap-2 border-2 px-2 text-[12px] uppercase tracking-wider sm:px-3 lg:px-4 lg:text-[13px] ${active ? "border-transparent text-primary-light hover:text-primary-light" : "border-transparent text-(--color-white-muted) hover:border-orange-dark hover:text-white"}`} aria-current={active ? "page" : undefined}>
                                    {indicator}
                                    <Icon className="relative z-10 h-5 w-5" />
                                    <span className="relative z-10 hidden sm:inline">{item.label}</span>
                                </Button>
                            );
                        }}
                    </Slider>
                </nav>
            </div>
        </header>
    );
}
