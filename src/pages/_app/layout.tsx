import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LobbyReturnLink } from "@/components/Lobby/LobbyReturnLink";

export const Route = createFileRoute("/_app")({
    component: AppLayout,
});

function AppLayout() {
    return (
        <div className="min-h-screen bg-[linear-gradient(var(--color-black-overlay),var(--color-black-overlay)),url('/images/backgrounds/quest-landscape.png')] bg-cover bg-fixed bg-center">
            <LobbyReturnLink />
            <div className="pt-20">
                <Outlet />
            </div>
        </div>
    );
}
