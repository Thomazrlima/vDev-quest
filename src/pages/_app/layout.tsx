import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LobbyReturnLink } from "@/components/Lobby/LobbyReturnLink";
import { NavBar } from "@/components/NavBar";
import { useNavigationMode } from "@/utils/use-navigation-mode";

export const Route = createFileRoute("/_app")({
    component: AppLayout,
});

function AppLayout() {
    const [navigationMode] = useNavigationMode();
    const usingNavBar = navigationMode === "navbar";

    return (
        <div className="min-h-screen bg-[linear-gradient(var(--color-black-overlay),var(--color-black-overlay)),url('/images/backgrounds/quest-landscape.png')] bg-cover bg-fixed bg-center">
            {/* Uma coisa ou outra: com a barra ligada, o vilarejo deixa de ser o caminho de volta. */}
            {usingNavBar ? <NavBar /> : <LobbyReturnLink />}
            {/* A barra é fixa nas duas pontas — cabeçalho no desktop, abas embaixo no celular. */}
            <div className={usingNavBar ? "pt-20 pb-24 md:pt-26 md:pb-0" : "pt-20"}>
                <Outlet />
            </div>
        </div>
    );
}
