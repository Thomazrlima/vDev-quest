import { createFileRoute, Outlet } from "@tanstack/react-router";
import { NavBar } from "@/components/NavBar";

export const Route = createFileRoute("/_app")({
    component: AppLayout,
});

function AppLayout() {
    return (
        <div className="min-h-screen bg-[linear-gradient(var(--color-black-overlay),var(--color-black-overlay)),url('/images/backgrounds/quest-landscape.png')] bg-cover bg-fixed bg-center">
            <NavBar />
            <div className="pt-22">
                <Outlet />
            </div>
        </div>
    );
}
